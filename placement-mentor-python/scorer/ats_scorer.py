"""ATS scoring module for computing comprehensive resume scores."""

import json
import os
import re
from collections import Counter
from typing import List, Dict, Any, Optional

from scorer.coverage_scorer import compute_coverage_score, compute_zone_based_coverage


# Module-level cache for domain map
_domain_map: Dict[str, Any] = {}
_domain_map_loaded: bool = False


def _get_domain_map_path() -> str:
    """
    Get the path to the domain map JSON file.

    Returns:
        Absolute path to domain_map.json.
    """
    module_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(module_dir)
    return os.path.join(project_root, "data", "domain_map.json")


def _load_domain_map() -> Dict[str, Any]:
    """
    Load the domain map from JSON file.

    Returns:
        Dictionary mapping domain names to their cluster configurations.
    """
    global _domain_map, _domain_map_loaded

    if _domain_map_loaded:
        return _domain_map

    try:
        with open(_get_domain_map_path(), 'r', encoding='utf-8') as f:
            _domain_map = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        _domain_map = {}

    _domain_map_loaded = True
    return _domain_map


def get_domain_map() -> Dict[str, Any]:
    """
    Get the loaded domain map.

    Returns:
        Dictionary of domain configurations.
    """
    return _load_domain_map()


def compute_semantic_score(resume_text: str, jd_text: str, debug: bool = False) -> float:
    """
    Compute semantic similarity between resume and job description using TF-IDF.

    Uses a JD-centric approach: measures how well the JD vocabulary is represented
    in the resume. This avoids the dilution problem when resumes are much longer.

    Args:
        resume_text: Full resume text content.
        jd_text: Full job description text.
        debug: If True, print debug information.

    Returns:
        Semantic similarity score as percentage (0-100), rounded to 1 decimal.
        Returns 0.0 if either text is empty or too short.
    """
    if not resume_text or len(resume_text.strip()) < 20:
        if debug:
            print(f"[DEBUG] Resume text too short: {len(resume_text) if resume_text else 0} chars")
        return 0.0
    if not jd_text or len(jd_text.strip()) < 20:
        if debug:
            print(f"[DEBUG] JD text too short: {len(jd_text) if jd_text else 0} chars")
        return 0.0

    if debug:
        print(f"[DEBUG] Resume length: {len(resume_text)} chars")
        print(f"[DEBUG] JD length: {len(jd_text)} chars")
        print(f"[DEBUG] Resume first 100 chars: {resume_text[:100].lower()}")
        print(f"[DEBUG] JD first 100 chars: {jd_text[:100].lower()}")

    try:
        # Common English stop words
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
            'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
            'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
            'also', 'now', 'our', 'your', 'if', 'any', 'about', 'into', 'through',
            'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out',
            'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
            'there', 'while', 'although', 'because', 'since', 'unless', 'until',
            'looking', 'hiring', 'need', 'needed', 'require', 'required', 'requirements',
            'experience', 'experienced', 'work', 'working', 'knowledge', 'skills',
            'ability', 'able', 'years', 'year', 'minimum', 'preferred', 'plus'
        }

        # Tokenize and clean
        def tokenize(text):
            words = re.findall(r'\b[a-z][a-z0-9+#]*(?:\.[a-z0-9]+)*\b', text.lower())
            return [w for w in words if len(w) >= 2 and w not in stop_words]

        jd_words = tokenize(jd_text)
        resume_words = tokenize(resume_text)

        if debug:
            print(f"[DEBUG] JD tokens: {len(jd_words)}, unique: {len(set(jd_words))}")
            print(f"[DEBUG] Resume tokens: {len(resume_words)}, unique: {len(set(resume_words))}")
            print(f"[DEBUG] JD unique words: {sorted(set(jd_words))[:20]}")

        if not jd_words:
            return 0.0

        # Count JD word frequencies (important words appear more)
        jd_word_counts = Counter(jd_words)
        resume_word_set = set(resume_words)

        # Calculate weighted match score
        # Words appearing multiple times in JD are weighted higher
        total_weight = sum(jd_word_counts.values())
        matched_weight = sum(count for word, count in jd_word_counts.items()
                            if word in resume_word_set)

        # Also check for bigrams (two-word phrases) from JD
        jd_bigrams = set()
        for i in range(len(jd_words) - 1):
            jd_bigrams.add(f"{jd_words[i]} {jd_words[i+1]}")

        resume_text_lower = resume_text.lower()
        bigram_matches = sum(1 for bg in jd_bigrams if bg in resume_text_lower)
        bigram_bonus = min(bigram_matches * 0.05, 0.15)  # Up to 15% bonus

        if debug:
            print(f"[DEBUG] JD bigrams: {len(jd_bigrams)}")
            print(f"[DEBUG] Bigram matches: {bigram_matches}")

        # Base score from word coverage
        word_coverage = matched_weight / total_weight if total_weight > 0 else 0

        # Final score with bigram bonus, scaled to 0-100
        raw_score = word_coverage + bigram_bonus

        # Scale: good coverage (0.6+) should give 80%+
        # Adjust scaling to be more generous for matching documents
        scaled = min(raw_score / 0.7, 1.0) * 100

        if debug:
            print(f"[DEBUG] Word coverage: {word_coverage:.4f}")
            print(f"[DEBUG] Bigram bonus: {bigram_bonus:.4f}")
            print(f"[DEBUG] Raw score: {raw_score:.4f}")
            print(f"[DEBUG] Scaled score: {scaled:.2f}")

        return round(float(scaled), 1)

    except Exception as e:
        if debug:
            print(f"[DEBUG] Exception: {e}")
        return 0.0


def _compute_experience_score(sections: Dict[str, str]) -> float:
    """
    Compute experience score based on section presence.

    Args:
        sections: Dictionary of resume sections.

    Returns:
        Experience score (0, 60, or 100).
    """
    experience_text = sections.get("experience", "")
    projects_text = sections.get("projects", "")

    if experience_text and experience_text.strip():
        return 100.0
    elif projects_text and projects_text.strip():
        return 60.0
    else:
        return 0.0


def _compute_structure_score(resume_text: str, sections: Dict[str, str]) -> Dict[str, Any]:
    """
    Compute structure score from length and section presence.

    Args:
        resume_text: Full resume text.
        sections: Dictionary of resume sections.

    Returns:
        Dictionary with structure_score, length_score, section_score,
        word_count, and sections_found.
    """
    # Length sub-score (50% of structure)
    word_count = len(resume_text.split()) if resume_text else 0

    if word_count >= 400:
        length_score = 100.0
    elif word_count >= 250:
        length_score = 70.0
    elif word_count >= 150:
        length_score = 40.0
    else:
        length_score = 10.0

    # Section presence sub-score (50% of structure)
    check_sections = ["experience", "education", "skills", "projects", "summary"]
    sections_found = []

    for section in check_sections:
        content = sections.get(section, "")
        if content and isinstance(content, str) and content.strip():
            sections_found.append(section)

    found_count = len(sections_found)
    section_score = (found_count / 5) * 100

    # Combined structure score
    structure_score = (length_score * 0.5) + (section_score * 0.5)

    return {
        "structure_score": round(structure_score, 1),
        "length_score": round(length_score, 1),
        "section_score": round(section_score, 1),
        "word_count": word_count,
        "sections_found": sections_found
    }


def compute_domain_score(
    resume_skills_all: List[str],
    domain_name: str
) -> Optional[Dict[str, Any]]:
    """
    Compute domain match score based on skill clusters.

    For each cluster in the domain definition, checks if any skill
    in the cluster exists in the resume's skill list.

    Args:
        resume_skills_all: List of all canonical skills from resume.
        domain_name: Domain name (e.g., "fullstack developer" or "fullstack_developer").

    Returns:
        Dictionary containing domain match details, or None if domain not found.
    """
    domain_map = _load_domain_map()

    if not domain_name:
        return None

    # Normalize domain name: try both formats
    normalized = domain_name.lower().strip()
    normalized_underscore = normalized.replace(" ", "_")
    normalized_space = normalized.replace("_", " ")

    # Find domain entry
    domain_entry = None
    if normalized_underscore in domain_map:
        domain_entry = domain_map[normalized_underscore]
    elif normalized_space in domain_map:
        domain_entry = domain_map[normalized_space]
    else:
        # Try to find by display_name
        for key, value in domain_map.items():
            if isinstance(value, dict):
                display = value.get("display_name", "").lower()
                if display == normalized or display == normalized_space:
                    domain_entry = value
                    break

    if not domain_entry:
        return None

    clusters = domain_entry.get("clusters", [])
    if not clusters:
        return None

    # Normalize resume skills for comparison
    resume_skills_lower = set(skill.lower() for skill in resume_skills_all) if resume_skills_all else set()

    satisfied_clusters = []
    missing_clusters = []

    for cluster in clusters:
        cluster_satisfied = False
        for skill in cluster:
            if skill.lower() in resume_skills_lower:
                cluster_satisfied = True
                break

        if cluster_satisfied:
            satisfied_clusters.append(cluster)
        else:
            missing_clusters.append(cluster)

    clusters_satisfied = len(satisfied_clusters)
    total_clusters = len(clusters)
    domain_match = (clusters_satisfied / total_clusters) if total_clusters > 0 else 0

    return {
        "domain_match_score": round(domain_match * 100, 1),
        "clusters_satisfied": clusters_satisfied,
        "total_clusters": total_clusters,
        "satisfied_clusters": satisfied_clusters,
        "missing_clusters": missing_clusters
    }


def compute_ats_score(
    resume_text: str,
    jd_text: str,
    resume_skills_all: List[str],
    jd_skills: List[str],
    sections: Dict[str, str],
    domain_name: str = ""
) -> Dict[str, Any]:
    """
    Compute comprehensive ATS score using zone-based skill analysis.

    Final Score = (skills_score × 0.55) + (semantic_score × 0.25) +
                  (experience_score × 0.05) + (structure_score × 0.15)

    If JD has fewer than 2 skills, uses domain inference mode with adjusted weights:
    domain_inference=0.70, experience=0.10, structure=0.20

    Args:
        resume_text: Full resume text content.
        jd_text: Full job description text.
        resume_skills_all: List of all skills extracted from full resume.
        jd_skills: List of skills extracted from job description.
        sections: Dictionary of resume sections from section_parser.
        domain_name: Optional domain name for domain inference scoring.

    Returns:
        Dictionary containing all score components and skill classifications.
    """
    # Determine if JD has explicit skills
    has_explicit_jd_skills = len(jd_skills) >= 2

    # Compute zone-based coverage
    zone_result = compute_zone_based_coverage(sections, jd_skills, resume_skills_all)
    skills_score = zone_result["skills_score"]

    # Also compute traditional coverage for backward compatibility
    matched_skills = zone_result["contextual_skills"] + zone_result["isolated_skills"]
    coverage_score = compute_coverage_score(matched_skills, jd_skills)

    # Compute semantic score
    semantic_score = compute_semantic_score(resume_text, jd_text)

    # Compute experience score
    experience_score = _compute_experience_score(sections)

    # Compute structure score
    structure_result = _compute_structure_score(resume_text, sections)
    structure_score = structure_result["structure_score"]

    # Compute domain score
    domain_score = compute_domain_score(resume_skills_all, domain_name) if domain_name else None

    # Apply dynamic weight adjustment
    if has_explicit_jd_skills:
        # Standard weights
        final_ats = (
            (skills_score * 0.55) +
            (semantic_score * 0.25) +
            (experience_score * 0.05) +
            (structure_score * 0.15)
        )
        weight_mode = "standard"
    else:
        # Domain inference mode
        if domain_score:
            domain_match_score = domain_score.get("domain_match_score", 0)
            final_ats = (
                (domain_match_score * 0.70) +
                (experience_score * 0.10) +
                (structure_score * 0.20)
            )
        else:
            # No domain provided, use structure-heavy weights
            final_ats = (
                (experience_score * 0.30) +
                (structure_score * 0.70)
            )
        weight_mode = "domain_inferred"
        # Set skills and semantic to 0 in domain inference mode
        skills_score = 0.0
        semantic_score = 0.0

    # Apply cap for domain inference mode
    score_capped = False
    cap_reason = ""
    if weight_mode == "domain_inferred" and final_ats > 85:
        final_ats = 85.0
        score_capped = True
        cap_reason = "Domain inference mode limits maximum confidence to 85%"

    return {
        "ats_score": round(final_ats, 1),
        "coverage_score": coverage_score,
        "skills_score": round(skills_score, 1),
        "semantic_score": round(semantic_score, 1),
        "experience_score": round(experience_score, 1),
        "structure_score": round(structure_score, 1),
        "domain_score": domain_score,
        "contextual_skills": zone_result["contextual_skills"],
        "isolated_skills": zone_result["isolated_skills"],
        "missing_skills": zone_result["missing_skills"],
        "extra_skills": zone_result["extra_skills"],
        "word_count": structure_result["word_count"],
        "sections_found": structure_result["sections_found"],
        "weight_mode": weight_mode,
        "score_capped": score_capped,
        "cap_reason": cap_reason,
        "components": {
            "skills_score": round(skills_score, 1),
            "semantic_score": round(semantic_score, 1),
            "experience_score": round(experience_score, 1),
            "structure_score": round(structure_score, 1),
            "length_score": structure_result["length_score"],
            "section_score": structure_result["section_score"]
        }
    }


if __name__ == "__main__":
    # Test semantic scoring with debug output
    print("=" * 60)
    print("SEMANTIC SCORE DEBUG TEST")
    print("=" * 60)

    # Short text test
    print("\n--- TEST 1: Short texts (similar to previous test) ---")
    short_resume = "Python developer with FastAPI PostgreSQL Docker REST APIs"
    short_jd = "Looking for backend developer Python FastAPI PostgreSQL Docker"
    score1 = compute_semantic_score(short_resume, short_jd, debug=True)
    print(f"Result: {score1}%\n")

    # Long resume vs short JD (realistic scenario)
    print("\n--- TEST 2: Long resume (400+ words) vs short JD ---")
    long_resume = """
    John Smith - Software Engineer
    
    SUMMARY
    Experienced software engineer with 5 years of expertise in backend development.
    Proficient in Python, JavaScript, and cloud technologies. Strong background in
    building scalable microservices and RESTful APIs.
    
    SKILLS
    Programming: Python, JavaScript, TypeScript, Java, Go
    Frameworks: FastAPI, Django, Flask, Node.js, Express
    Databases: PostgreSQL, MySQL, MongoDB, Redis
    Cloud: AWS, GCP, Docker, Kubernetes
    Tools: Git, Jenkins, Terraform, Linux
    
    EXPERIENCE
    Senior Software Engineer at TechCorp (2021-Present)
    - Designed and implemented microservices architecture serving 10M+ users
    - Built RESTful APIs using Python FastAPI with PostgreSQL database
    - Deployed containerized applications using Docker and Kubernetes on AWS
    - Implemented CI/CD pipelines with Jenkins and GitHub Actions
    - Mentored junior developers and conducted code reviews
    - Reduced API response time by 40% through query optimization
    
    Software Engineer at StartupXYZ (2019-2021)
    - Developed full-stack web applications using React and Node.js
    - Created data pipelines for processing large datasets
    - Integrated third-party APIs and payment gateways
    - Collaborated with product team using Agile methodology
    
    PROJECTS
    E-commerce Platform
    - Built scalable backend with Python Django and PostgreSQL
    - Implemented authentication using JWT tokens
    - Deployed on AWS EC2 with load balancing
    
    Real-time Chat Application
    - Developed WebSocket server using Node.js
    - Used Redis for message queue and session management
    - Containerized with Docker for easy deployment
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology (2015-2019)
    
    CERTIFICATIONS
    - AWS Solutions Architect Associate
    - Google Cloud Professional Developer
    """

    jd_text = """
    We are hiring a Backend Developer with experience in Python, FastAPI, 
    PostgreSQL, Docker and REST APIs. Knowledge of Git and Linux is required.
    AWS experience preferred.
    """

    score2 = compute_semantic_score(long_resume, jd_text, debug=True)
    print(f"Result: {score2}%\n")

    # Unrelated texts
    print("\n--- TEST 3: Unrelated texts ---")
    unrelated_resume = """
    Marketing Manager with expertise in brand strategy and digital campaigns.
    Experience with SEO, social media marketing, content creation, and analytics.
    Managed budgets of over $5M annually. Led teams of 10+ marketing professionals.
    """
    unrelated_jd = """
    Looking for a data scientist with machine learning experience.
    Must know Python, TensorFlow, PyTorch, and statistical analysis.
    PhD preferred. Experience with deep learning required.
    """
    score3 = compute_semantic_score(unrelated_resume, unrelated_jd, debug=True)
    print(f"Result: {score3}%\n")

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Test 1 (short matching): {score1}%")
    print(f"Test 2 (long resume vs JD): {score2}%")
    print(f"Test 3 (unrelated): {score3}%")
