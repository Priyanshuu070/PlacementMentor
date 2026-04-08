"""Suggestion engine module for generating resume improvement suggestions."""

from typing import List, Dict, Any


def generate_suggestions(
    matched: List[str],
    missing: List[str],
    ats_components: Dict[str, Any],
    sections: Dict[str, str],
    resume_text: str
) -> List[str]:
    """
    Generate rule-based suggestions for improving a resume.

    Analyzes the resume's skill gaps, coverage score, length, and section
    presence to provide actionable improvement suggestions in priority order.

    Args:
        matched: List of canonical skill names found in both resume and JD.
        missing: List of canonical skill names in JD but not in resume.
        ats_components: Dictionary containing ATS component scores including
                       skill_coverage, keyword_density, length_score, section_score.
        sections: Dictionary of resume sections (experience, education, etc.).
        resume_text: Full resume text content.

    Returns:
        List of suggestion strings, capped at 8 suggestions maximum.
    """
    suggestions = []

    # Extract component values
    coverage_score = ats_components.get("skill_coverage", 0)
    word_count = len(resume_text.split()) if resume_text else 0

    # Rule 1: Missing skills (up to 5)
    missing_to_add = missing[:5] if missing else []
    for skill in missing_to_add:
        suggestions.append(f"Add {skill} to your skills section")

    # Rule 2: Coverage score < 40%
    if coverage_score < 40:
        suggestions.append(
            "Your resume matches less than 40% of required skills. "
            "Consider a significant rewrite targeting this role."
        )
    # Rule 3: Coverage score between 40-60%
    elif 40 <= coverage_score < 60:
        suggestions.append(
            "Your resume partially matches this role. "
            "Focus on adding the missing technical skills."
        )

    # Rule 4: Word count < 200
    if word_count < 200:
        suggestions.append(
            "Your resume is too short. Add more detail to your "
            "projects and experience sections."
        )
    # Rule 5: Word count between 200-350
    elif 200 <= word_count < 350:
        suggestions.append(
            "Consider expanding your project descriptions with "
            "technologies used and impact achieved."
        )

    # Rule 6: No experience AND no projects
    experience_content = sections.get("experience", "")
    projects_content = sections.get("projects", "")

    experience_empty = not experience_content or not experience_content.strip()
    projects_empty = not projects_content or not projects_content.strip()

    if experience_empty and projects_empty:
        suggestions.append(
            "Add a Projects section demonstrating your technical skills in practice."
        )

    # Rule 7: No education
    education_content = sections.get("education", "")
    if not education_content or not education_content.strip():
        suggestions.append(
            "Add an Education section with your degree and institution."
        )

    # Rule 8: More than 5 missing skills
    if len(missing) > 5:
        suggestions.append(
            f"You are missing {len(missing)} required skills. "
            "Prioritise learning the most critical ones."
        )

    # Cap at 8 suggestions
    return suggestions[:8]
