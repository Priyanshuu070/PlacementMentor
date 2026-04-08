"""PlacementMentor FastAPI Resume Analysis Service."""

import json
import os
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
from matcher.skill_matcher import extract_skills_from_text
from matcher.skill_dictionary import get_all_skills
from scorer.ats_scorer import compute_ats_score, get_domain_map
from suggester.suggestion_engine import generate_suggestions
from suggester.explainer import generate_explanation

# Module-level counters for health check
_skills_count = 0
_domains_count = 0


def _extract_job_position(jd_text: str) -> str:
    """
    Extract job position from job description text using heuristics.

    Looks for common patterns like "role:", "position:", "job title:",
    "hiring a", "looking for a", "we need a", "seeking a".

    Args:
        jd_text: Full job description text.

    Returns:
        Extracted job position or "Target Role" as default.
    """
    if not jd_text:
        return "Target Role"

    jd_lower = jd_text.lower()

    # Pattern-based extraction (in priority order)
    patterns = [
        r'role\s*:\s*([^\n,\.]+)',
        r'position\s*:\s*([^\n,\.]+)',
        r'job\s*title\s*:\s*([^\n,\.]+)',
        r'hiring\s+(?:a\s+|an\s+)?([^\n,\.]+)',
        r'looking\s+for\s+(?:a\s+|an\s+)?([^\n,\.]+)',
        r'we\s+need\s+(?:a\s+|an\s+)?([^\n,\.]+)',
        r'seeking\s+(?:a\s+|an\s+)?([^\n,\.]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, jd_lower)
        if match:
            position = match.group(1).strip()
            # Clean up and capitalize
            position = re.sub(r'\s+', ' ', position)
            # Limit to 2-3 words for cleaner output
            words = position.split()[:3]
            if words:
                return ' '.join(words).title()

    return "Target Role"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    global _skills_count, _domains_count

    # Startup
    print("PlacementMentor Python Service starting...")
    skills = get_all_skills()
    _skills_count = len(skills)
    print(f"Skill dictionary loaded: {_skills_count} skills")

    # Load and validate domain map
    domain_map = get_domain_map()
    _domains_count = len(domain_map)
    print(f"Domain map loaded: {_domains_count} domains")

    print("Service ready on port 8000")
    yield
    # Shutdown
    print("PlacementMentor Python Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="PlacementMentor Resume Analyzer",
    description="AI-powered resume analysis and ATS scoring service",
    version="2.0.0",
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
        JSON response with status "ok" and loaded resource counts.
    """
    return {
        "status": "ok",
        "skills_loaded": _skills_count,
        "domains_loaded": _domains_count
    }


@app.get("/domains")
async def list_domains():
    """
    List all available domains for scoring.

    Returns:
        JSON response with list of domain names and their display names.
    """
    try:
        domain_map = get_domain_map()
        domains = []
        for key, value in domain_map.items():
            if isinstance(value, dict):
                display_name = value.get("display_name", key.replace("_", " ").title())
                domains.append({
                    "id": key,
                    "display_name": display_name
                })
        return {"domains": domains}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to load domains: {str(e)}"}
        )


@app.post("/analyse")
async def analyse_resume(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
    user_email: str = Form(...),
    session_id: Optional[str] = Form(""),
    domain_name: Optional[str] = Form("")
):
    """
    Analyze a resume against a job description.

    Processes the uploaded PDF resume through the full analysis pipeline:
    parsing, skill extraction, zone-based matching, scoring, and suggestion generation.

    Args:
        resume: Uploaded PDF file.
        jd_text: Job description text.
        user_email: User's email address.
        session_id: Optional session identifier.
        domain_name: Optional domain name for domain inference scoring.

    Returns:
        JSON response with analysis results or error.
    """
    try:
        # Step a: Read PDF bytes
        pdf_bytes = await resume.read()

        # Step b: Parse PDF
        parse_result = parse_resume_pdf(pdf_bytes)

        # Step c: Check parse success
        if not parse_result.get("success", False):
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Could not extract text from PDF"
                }
            )

        raw_text = parse_result.get("raw_text", "")
        parser_used = parse_result.get("parser_chosen", "unknown")

        # Step d: Extract sections
        sections = extract_sections(raw_text)

        # Step e: Extract resume skills
        resume_skills = extract_skills_from_text(raw_text)

        # Step f: Extract JD skills
        jd_skills = extract_skills_from_text(jd_text)

        # Step g: Compute ATS score
        ats_result = compute_ats_score(
            resume_text=raw_text,
            jd_text=jd_text,
            resume_skills_all=resume_skills,
            jd_skills=jd_skills,
            sections=sections,
            domain_name=domain_name or ""
        )

        # Get matched skills from ats_result
        contextual_skills = ats_result.get("contextual_skills", [])
        isolated_skills = ats_result.get("isolated_skills", [])
        matched_skills = contextual_skills + isolated_skills
        missing_skills = ats_result.get("missing_skills", [])

        # Step h: Generate suggestions
        suggestions = generate_suggestions(
            matched=matched_skills,
            missing=missing_skills,
            ats_result=ats_result,
            sections=sections,
            resume_text=raw_text,
            domain_name=domain_name or ""
        )

        # Step j: Extract job position
        job_position = _extract_job_position(jd_text)

        # Step i: Generate explanation
        explanation = generate_explanation(
            ats_score=ats_result.get("ats_score", 0),
            coverage_score=ats_result.get("coverage_score", 0),
            matched=matched_skills,
            missing=missing_skills,
            job_position=job_position,
            components=ats_result.get("components", {})
        )

        # Return structured response
        return {
            "success": True,
            "job_position": job_position,
            "ats_score": ats_result.get("ats_score", 0),
            "coverage_score": ats_result.get("coverage_score", 0),
            "weight_mode": ats_result.get("weight_mode", "standard"),
            "score_capped": ats_result.get("score_capped", False),
            "skills_score": ats_result.get("skills_score", 0),
            "semantic_score": ats_result.get("semantic_score", 0),
            "experience_score": ats_result.get("experience_score", 0),
            "structure_score": ats_result.get("structure_score", 0),
            "domain_score": ats_result.get("domain_score"),
            "detected_skills_resume": resume_skills,
            "detected_skills_jd": jd_skills,
            "contextual_skills": contextual_skills,
            "isolated_skills": isolated_skills,
            "skill_gaps": missing_skills,
            "extra_skills": ats_result.get("extra_skills", []),
            "suggestions": suggestions,
            "explanation": explanation,
            "resume_raw_text": raw_text,
            "word_count": ats_result.get("word_count", 0),
            "sections_found": ats_result.get("sections_found", []),
            "parser_used": parser_used,
            "user_email": user_email,
            "session_id": session_id or "",
            "domain_name": domain_name or ""
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
