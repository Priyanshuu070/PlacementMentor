"""ATS scoring module for computing comprehensive resume scores."""

import re
from typing import List, Dict, Any

from scorer.coverage_scorer import compute_coverage_score


def _extract_unique_words(text: str, min_length: int = 4) -> set:
    """
    Extract unique lowercase words from text.

    Args:
        text: Text to extract words from.
        min_length: Minimum word length to include.

    Returns:
        Set of unique lowercase words longer than min_length.
    """
    if not text:
        return set()

    # Extract words (alphanumeric sequences)
    words = re.findall(r'[a-zA-Z0-9]+', text.lower())

    # Filter by length
    return {word for word in words if len(word) > min_length - 1}


def _compute_keyword_density(resume_text: str, jd_text: str) -> float:
    """
    Compute keyword density score based on JD word presence in resume.

    Args:
        resume_text: Full resume text.
        jd_text: Full job description text.

    Returns:
        Keyword density as percentage (0-100).
    """
    jd_words = _extract_unique_words(jd_text, min_length=4)

    if not jd_words:
        return 0.0

    resume_lower = resume_text.lower() if resume_text else ""

    # Count how many JD words appear in resume
    matches = sum(1 for word in jd_words if word in resume_lower)

    density = (matches / len(jd_words)) * 100

    return density


def _compute_length_score(word_count: int) -> float:
    """
    Compute resume length score based on word count.

    Args:
        word_count: Number of words in resume.

    Returns:
        Length score (20, 60, or 100).
    """
    if word_count >= 400:
        return 100.0
    elif word_count >= 200:
        return 60.0
    else:
        return 20.0


def _compute_section_score(sections: Dict[str, str]) -> tuple:
    """
    Compute section presence score.

    Args:
        sections: Dictionary of section names to their content.

    Returns:
        Tuple of (section_score, list of found section names).
    """
    required_sections = ["experience", "education", "skills", "projects", "summary"]
    found_sections = []

    for section in required_sections:
        content = sections.get(section, "")
        if content and isinstance(content, str) and content.strip():
            found_sections.append(section)

    found_count = len(found_sections)
    section_score = (found_count / 5) * 100

    return section_score, found_sections


def compute_ats_score(
    resume_text: str,
    jd_text: str,
    matched: List[str],
    jd_skills: List[str],
    sections: Dict[str, str]
) -> Dict[str, Any]:
    """
    Compute comprehensive ATS (Applicant Tracking System) compatibility score.

    Evaluates a resume against a job description using four weighted components:
    1. Skill coverage (60%): How well resume skills match JD requirements
    2. Keyword density (20%): Presence of JD keywords in resume
    3. Resume length (10%): Appropriate resume length
    4. Section presence (10%): Presence of standard resume sections

    Args:
        resume_text: Full resume text content.
        jd_text: Full job description text.
        matched: List of skill names found in both resume and JD.
        jd_skills: List of all skill names from the job description.
        sections: Dictionary of resume sections (experience, education, etc.).

    Returns:
        Dictionary containing:
            - ats_score: Final weighted ATS score (0-100, 1 decimal)
            - coverage_score: Skill coverage component score
            - components: Dict with all 4 component scores
            - word_count: Number of words in resume
            - sections_found: List of detected section names
    """
    # Component 1: Skill coverage (weight 0.60)
    coverage_score = compute_coverage_score(matched, jd_skills)

    # Component 2: Keyword density (weight 0.20)
    keyword_density = _compute_keyword_density(resume_text, jd_text)

    # Component 3: Resume length (weight 0.10)
    word_count = len(resume_text.split()) if resume_text else 0
    length_score = _compute_length_score(word_count)

    # Component 4: Section presence (weight 0.10)
    section_score, sections_found = _compute_section_score(sections)

    # Calculate final ATS score
    final_ats = (
        (coverage_score * 0.60) +
        (keyword_density * 0.20) +
        (length_score * 0.10) +
        (section_score * 0.10)
    )

    return {
        "ats_score": round(final_ats, 1),
        "coverage_score": coverage_score,
        "components": {
            "skill_coverage": round(coverage_score, 1),
            "keyword_density": round(keyword_density, 1),
            "length_score": round(length_score, 1),
            "section_score": round(section_score, 1)
        },
        "word_count": word_count,
        "sections_found": sections_found
    }
