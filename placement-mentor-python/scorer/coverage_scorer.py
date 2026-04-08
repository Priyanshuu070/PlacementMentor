"""Coverage scoring module for computing skill match coverage."""

from typing import List

from matcher.skill_dictionary import get_skill_weight


def compute_coverage_score(matched: List[str], jd_skills: List[str]) -> float:
    """
    Compute weighted coverage score of matched skills against job description skills.

    The coverage score represents how well a resume's skills match the job
    description requirements, weighted by each skill's frequency weight
    (importance in the job market).

    Formula:
        coverage = (weighted_matched / weighted_total) * 100

    Args:
        matched: List of canonical skill names that appear in both resume and JD.
        jd_skills: List of all canonical skill names from the job description.

    Returns:
        Coverage score as a percentage (0-100), rounded to 1 decimal place.
        Returns 0.0 if jd_skills is empty.
    """
    if not jd_skills:
        return 0.0

    # Calculate weighted sum for matched skills
    weighted_matched = sum(get_skill_weight(skill) for skill in matched) if matched else 0

    # Calculate weighted sum for all JD skills
    weighted_total = sum(get_skill_weight(skill) for skill in jd_skills)

    if weighted_total == 0:
        return 0.0

    coverage = (weighted_matched / weighted_total) * 100

    return round(coverage, 1)
