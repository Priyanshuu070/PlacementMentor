"""PlacementMentor FastAPI Resume Analysis Service."""

import re
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv()

# Import pipeline modules
from parser.pdf_parser import parse_resume_pdf
from parser.section_parser import extract_sections
from matcher.skill_matcher import extract_skills_from_text, match_skills
from matcher.skill_dictionary import get_all_skills
from scorer.ats_scorer import compute_ats_score
from suggester.suggestion_engine import generate_suggestions
from suggester.explainer import generate_explanation


def _extract_job_position(jd_text: str) -> str:
    """
    Extract job position from job description text using heuristics.

    Looks for common patterns like "role:", "position:", "job title:",
    "we are looking for", "hiring a", "looking for a".

    Args:
        jd_text: Full job description text.

    Returns:
        Extracted job position or "Target Role" as default.
    """
    if not jd_text:
        return "Target Role"

    jd_lower = jd_text.lower()

    # Pattern-based extraction
    patterns = [
        r'role\s*:\s*([^\n,]+)',
        r'position\s*:\s*([^\n,]+)',
        r'job\s*title\s*:\s*([^\n,]+)',
        r'we\s+are\s+looking\s+for\s+(?:a\s+|an\s+)?([^\n,\.]+)',
        r'hiring\s+(?:a\s+|an\s+)?([^\n,\.]+)',
        r'looking\s+for\s+(?:a\s+|an\s+)?([^\n,\.]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, jd_lower)
        if match:
            position = match.group(1).strip()
            # Clean up and capitalize
            position = re.sub(r'\s+', ' ', position)
            # Limit to reasonable length
            words = position.split()[:6]
            if words:
                return ' '.join(words).title()

    return "Target Role"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    print("PlacementMentor Python Service starting...")
    skills = get_all_skills()
    print(f"Skill dictionary loaded: {len(skills)} skills")
    print("Service ready on port 8000")
    yield
    # Shutdown
    print("PlacementMentor Python Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="PlacementMentor Resume Analyzer",
    description="AI-powered resume analysis and ATS scoring service",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        JSON response with status "ok".
    """
    return {"status": "ok"}


@app.post("/analyse")
async def analyse_resume(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
    user_email: str = Form(...),
    session_id: Optional[str] = Form("")
):
    """
    Analyze a resume against a job description.

    Processes the uploaded PDF resume through the full analysis pipeline:
    parsing, skill extraction, matching, scoring, and suggestion generation.

    Args:
        resume: Uploaded PDF file.
        jd_text: Job description text.
        user_email: User's email address.
        session_id: Optional session identifier.

    Returns:
        JSON response with analysis results or error.
    """
    try:
        # Step 1: Read PDF bytes
        pdf_bytes = await resume.read()

        # Step 2: Parse PDF
        parse_result = parse_resume_pdf(pdf_bytes)

        # Step 3: Check parse success
        if not parse_result.get("success", False):
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Could not extract text from PDF"
                }
            )

        raw_text = parse_result.get("raw_text", "")

        # Step 4: Extract sections
        sections = extract_sections(raw_text)

        # Step 5: Extract resume skills
        resume_skills = extract_skills_from_text(raw_text)

        # Step 6: Extract JD skills
        jd_skills = extract_skills_from_text(jd_text)

        # Step 7: Match skills
        skill_match_result = match_skills(resume_skills, jd_skills)
        matched_skills = skill_match_result.get("matched", [])
        missing_skills = skill_match_result.get("missing", [])
        extra_skills = skill_match_result.get("extra", [])

        # Step 8: Compute ATS score
        ats_result = compute_ats_score(
            resume_text=raw_text,
            jd_text=jd_text,
            matched=matched_skills,
            jd_skills=jd_skills,
            sections=sections
        )

        # Step 9: Generate suggestions
        suggestions = generate_suggestions(
            matched=matched_skills,
            missing=missing_skills,
            ats_components=ats_result.get("components", {}),
            sections=sections,
            resume_text=raw_text
        )

        # Step 10: Extract job position
        job_position = _extract_job_position(jd_text)

        # Step 11: Generate explanation
        explanation = generate_explanation(
            ats_score=ats_result.get("ats_score", 0),
            coverage_score=ats_result.get("coverage_score", 0),
            matched=matched_skills,
            missing=missing_skills,
            job_position=job_position,
            components=ats_result.get("components", {})
        )

        # Step 12: Return structured response
        return {
            "success": True,
            "job_position": job_position,
            "detected_skills_resume": resume_skills,
            "detected_skills_jd": jd_skills,
            "skill_gaps": missing_skills,
            "matched_skills": matched_skills,
            "coverage_score": ats_result.get("coverage_score", 0),
            "ats_score": ats_result.get("ats_score", 0),
            "ats_components": ats_result.get("components", {}),
            "suggestions": suggestions,
            "explanation": explanation,
            "resume_raw_text": raw_text,
            "word_count": ats_result.get("word_count", 0),
            "sections_found": ats_result.get("sections_found", []),
            "user_email": user_email,
            "session_id": session_id or ""
        }

    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}"
            }
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
