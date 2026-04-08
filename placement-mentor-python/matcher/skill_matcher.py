"""Skill matching module for extracting and comparing skills."""

from typing import List, Dict

from matcher.skill_dictionary import search_skills_in_text


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract all recognized skills from a text string.

    Scans the text for known skills from the skill dictionary,
    matching against both canonical names and aliases using
    word boundary matching to avoid partial matches.

    Args:
        text: Text to scan for skills (e.g., resume content, job description).

    Returns:
        List of unique canonical skill names found in the text.
        Returns empty list if text is empty or no skills found.
    """
    if not text or not text.strip():
        return []

    # Use the skill dictionary's search function
    skills = search_skills_in_text(text)

    # Return sorted for consistent output
    return sorted(skills)


def match_skills(resume_skills: List[str], jd_skills: List[str]) -> Dict[str, List[str]]:
    """
    Compare skills from a resume against skills from a job description.

    Identifies which skills match between resume and job description,
    which skills are missing from the resume, and which extra skills
    the resume has that aren't in the job description.

    Args:
        resume_skills: List of canonical skill names from resume.
        jd_skills: List of canonical skill names from job description.

    Returns:
        Dictionary containing:
            - matched: Skills present in both resume and job description
            - missing: Skills in job description but not in resume
            - extra: Skills in resume but not in job description
    """
    # Convert to sets for efficient comparison (lowercase for consistency)
    resume_set = set(skill.lower() for skill in resume_skills) if resume_skills else set()
    jd_set = set(skill.lower() for skill in jd_skills) if jd_skills else set()

    matched = resume_set & jd_set
    missing = jd_set - resume_set
    extra = resume_set - jd_set

    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "extra": sorted(extra)
    }
