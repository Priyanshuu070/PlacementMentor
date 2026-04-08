"""Coverage scoring module for computing skill match coverage."""

from typing import List, Dict, Any, Set

from matcher.skill_dictionary import get_skill_weight
from matcher.skill_matcher import extract_skills_from_text


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


def compute_zone_based_coverage(
    sections: Dict[str, str],
    jd_skills: List[str],
    resume_skills_all: List[str]
) -> Dict[str, Any]:
    """
    Compute zone-based skill coverage using Zone A and Zone B logic.

    Zone A (contextual): experience, projects, internships - skills demonstrated in context
    Zone B (isolated): skills, summary, certifications - skills only listed

    Scoring:
        - Skill in Zone A: weight 1.0 (contextual)
        - Skill in Zone B only: weight 0.5 (isolated)
        - Skill not found: weight 0.0 (missing)

    Args:
        sections: Dictionary of resume sections from section_parser.
        jd_skills: List of canonical skill names from the job description.
        resume_skills_all: List of all skills found in the full resume.

    Returns:
        Dictionary containing:
            - skills_score: Zone-weighted coverage score (0-100)
            - contextual_skills: JD skills found in Zone A
            - isolated_skills: JD skills in Zone B but not Zone A
            - missing_skills: JD skills not found anywhere
            - extra_skills: Resume skills not in JD
            - zone_a_skills: All skills found in Zone A
            - zone_b_skills: All skills found in Zone B
    """
    if not jd_skills:
        return {
            "skills_score": 0.0,
            "contextual_skills": [],
            "isolated_skills": [],
            "missing_skills": [],
            "extra_skills": list(resume_skills_all) if resume_skills_all else [],
            "zone_a_skills": [],
            "zone_b_skills": []
        }

    # Build zone texts
    zone_a_text = (
        sections.get("experience", "") + " " +
        sections.get("projects", "") + " " +
        sections.get("internships", "")
    ).strip()

    zone_b_text = (
        sections.get("skills", "") + " " +
        sections.get("summary", "") + " " +
        sections.get("certifications", "")
    ).strip()

    # Extract skills from each zone
    zone_a_skills: Set[str] = set(extract_skills_from_text(zone_a_text))
    zone_b_skills: Set[str] = set(extract_skills_from_text(zone_b_text))

    # Classify JD skills
    jd_skills_set = set(skill.lower() for skill in jd_skills)
    resume_skills_set = set(skill.lower() for skill in resume_skills_all) if resume_skills_all else set()

    contextual_skills: List[str] = []
    isolated_skills: List[str] = []
    missing_skills: List[str] = []

    skills_raw = 0.0
    skills_max = len(jd_skills) * 1.0

    for skill in jd_skills:
        skill_lower = skill.lower()
        if skill_lower in zone_a_skills:
            contextual_skills.append(skill)
            skills_raw += 1.0
        elif skill_lower in zone_b_skills:
            isolated_skills.append(skill)
            skills_raw += 0.5
        else:
            missing_skills.append(skill)

    # Calculate skills score
    skills_score = (skills_raw / skills_max) * 100 if skills_max > 0 else 0.0

    # Calculate extra skills (in resume but not in JD)
    extra_skills = [skill for skill in resume_skills_all if skill.lower() not in jd_skills_set]

    return {
        "skills_score": round(skills_score, 1),
        "contextual_skills": sorted(contextual_skills),
        "isolated_skills": sorted(isolated_skills),
        "missing_skills": sorted(missing_skills),
        "extra_skills": sorted(extra_skills),
        "zone_a_skills": sorted(zone_a_skills),
        "zone_b_skills": sorted(zone_b_skills)
    }
