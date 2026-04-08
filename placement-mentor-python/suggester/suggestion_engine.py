"""Suggestion engine module for generating resume improvement suggestions."""

from typing import List, Dict, Any, Optional


def generate_suggestions(
    matched: List[str],
    missing: List[str],
    ats_result: Dict[str, Any],
    sections: Dict[str, str],
    resume_text: str,
    domain_name: str = ""
) -> List[str]:
    """
    Generate rule-based suggestions for improving a resume.

    Analyzes the resume's skill gaps, coverage score, length, section presence,
    domain match, and zone-based skill classification to provide actionable
    improvement suggestions in priority order.

    Args:
        matched: List of canonical skill names found in both resume and JD.
        missing: List of canonical skill names in JD but not in resume.
        ats_result: Full ATS result dictionary from compute_ats_score containing
                   components, domain_score, weight_mode, isolated_skills, etc.
        sections: Dictionary of resume sections (experience, education, etc.).
        resume_text: Full resume text content.
        domain_name: Optional domain name for domain-specific suggestions.

    Returns:
        List of suggestion strings, capped at 8 suggestions maximum.
    """
    suggestions = []

    # Extract values from ats_result
    components = ats_result.get("components", {})
    domain_score = ats_result.get("domain_score")
    weight_mode = ats_result.get("weight_mode", "standard")
    isolated_skills = ats_result.get("isolated_skills", [])
    missing_skills = ats_result.get("missing_skills", missing)
    skills_score = components.get("skills_score", 0)
    word_count = ats_result.get("word_count", 0)

    # Rule 1: Domain inference mode notification
    if weight_mode == "domain_inferred" and domain_name:
        suggestions.append(
            f"Your JD doesn't list specific skills. Score is based on "
            f"your match with the {domain_name} role profile."
        )

    # Rule 2: Missing cluster suggestions (for domain inference mode)
    if domain_score and domain_score.get("missing_clusters"):
        missing_clusters = domain_score["missing_clusters"][:3]
        for cluster in missing_clusters:
            cluster_skills = ", ".join(cluster[:4])
            suggestions.append(
                f"You're missing skills in this area. "
                f"Consider adding one of: {cluster_skills}"
            )

    # Rule 3: Isolated skills suggestions
    if isolated_skills:
        for skill in isolated_skills[:2]:
            suggestions.append(
                f"You list {skill} but haven't demonstrated it in projects "
                f"or experience. Add a project using {skill}."
            )

    # Rule 4: Missing skills (up to 5)
    missing_to_add = missing_skills[:5] if missing_skills else []
    for skill in missing_to_add:
        if len(suggestions) >= 8:
            break
        suggestions.append(f"Add {skill} to your skills section")

    # Rule 5: Coverage score < 40%
    if skills_score < 40 and weight_mode == "standard":
        suggestions.append(
            "Your resume matches less than 40% of required skills. "
            "Consider a significant rewrite targeting this role."
        )
    # Rule 6: Coverage score between 40-60%
    elif 40 <= skills_score < 60 and weight_mode == "standard":
        suggestions.append(
            "Your resume partially matches this role. "
            "Focus on adding the missing technical skills."
        )

    # Rule 7: Word count < 200
    if word_count < 200:
        suggestions.append(
            "Your resume is too short. Add more detail to your "
            "projects and experience sections."
        )
    # Rule 8: Word count between 200-350
    elif 200 <= word_count < 350:
        suggestions.append(
            "Consider expanding your project descriptions with "
            "technologies used and impact achieved."
        )

    # Rule 9: No experience AND no projects
    experience_content = sections.get("experience", "")
    projects_content = sections.get("projects", "")

    experience_empty = not experience_content or not experience_content.strip()
    projects_empty = not projects_content or not projects_content.strip()

    if experience_empty and projects_empty:
        suggestions.append(
            "Add a Projects section demonstrating your technical skills in practice."
        )

    # Rule 10: No education
    education_content = sections.get("education", "")
    if not education_content or not education_content.strip():
        suggestions.append(
            "Add an Education section with your degree and institution."
        )

    # Rule 11: More than 5 missing skills
    if len(missing_skills) > 5:
        suggestions.append(
            f"You are missing {len(missing_skills)} required skills. "
            "Prioritise learning the most critical ones."
        )

    # Cap at 8 suggestions
    return suggestions[:8]
