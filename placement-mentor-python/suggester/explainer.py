"""Explainer module for generating AI-powered ATS score explanations."""

import os
from typing import List, Dict, Any

import requests


def _build_prompt(
    ats_score: float,
    coverage_score: float,
    matched: List[str],
    missing: List[str],
    job_position: str,
    components: Dict[str, Any]
) -> str:
    """
    Build a prompt for the LLM to explain the ATS score.

    Args:
        ats_score: Final ATS compatibility score.
        coverage_score: Skill coverage component score.
        matched: List of matched skill names.
        missing: List of missing skill names.
        job_position: Target job position title.
        components: Dictionary of all ATS component scores.

    Returns:
        Formatted prompt string for the LLM.
    """
    matched_str = ", ".join(matched[:10]) if matched else "none"
    missing_str = ", ".join(missing[:10]) if missing else "none"

    prompt = f"""Analyze this resume ATS score and provide a brief explanation.

Job Position: {job_position}
Overall ATS Score: {ats_score}/100
Skill Coverage Score: {coverage_score}%

Component Breakdown:
- Skill Coverage: {components.get('skill_coverage', 0)}%
- Keyword Density: {components.get('keyword_density', 0)}%
- Resume Length: {components.get('length_score', 0)}%
- Section Presence: {components.get('section_score', 0)}%

Matched Skills: {matched_str}
Missing Skills: {missing_str}

In 3-4 sentences, explain:
1. Why the score is what it is
2. What the biggest gaps are
3. One specific actionable recommendation

Be direct and helpful. Do not use bullet points or markdown formatting."""

    return prompt


def _generate_fallback(
    ats_score: float,
    matched: List[str],
    missing: List[str],
    job_position: str
) -> str:
    """
    Generate a fallback explanation without using an LLM.

    Args:
        ats_score: Final ATS compatibility score.
        matched: List of matched skill names.
        missing: List of missing skill names.
        job_position: Target job position title.

    Returns:
        Formatted fallback explanation string.
    """
    missing_preview = missing[:3] if missing else []
    gaps_str = ", ".join(missing_preview) if missing_preview else "none identified"

    return (
        f"Your resume scores {ats_score}/100 for {job_position}. "
        f"You match {len(matched)} of the required skills. "
        f"Key gaps include: {gaps_str}."
    )


def generate_explanation(
    ats_score: float,
    coverage_score: float,
    matched: List[str],
    missing: List[str],
    job_position: str,
    components: Dict[str, Any]
) -> str:
    """
    Generate a human-readable explanation of the ATS score using OpenRouter API.

    Calls the OpenRouter API with Gemma 2 model to generate a natural language
    explanation of the resume's ATS score, gaps, and recommendations.
    Falls back to a template-based explanation if the API call fails.

    Args:
        ats_score: Final ATS compatibility score (0-100).
        coverage_score: Skill coverage component score (0-100).
        matched: List of canonical skill names found in both resume and JD.
        missing: List of canonical skill names in JD but not in resume.
        job_position: Target job position title (e.g., "Senior Python Developer").
        components: Dictionary of ATS component scores (skill_coverage,
                   keyword_density, length_score, section_score).

    Returns:
        Human-readable explanation string. Returns fallback explanation
        if API call fails for any reason.
    """
    # Get API key from environment
    api_key = os.environ.get("OPENROUTER_API_KEY")

    if not api_key:
        return _generate_fallback(ats_score, matched, missing, job_position)

    # Build the prompt
    prompt = _build_prompt(
        ats_score, coverage_score, matched, missing, job_position, components
    )

    # API request
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "google/gemma-4-26b-a4b-it:free",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 300,
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        explanation = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if explanation and explanation.strip():
            return explanation.strip()
        else:
            return _generate_fallback(ats_score, matched, missing, job_position)

    except requests.exceptions.RequestException:
        return _generate_fallback(ats_score, matched, missing, job_position)
    except (KeyError, IndexError, TypeError):
        return _generate_fallback(ats_score, matched, missing, job_position)
    except Exception:
        return _generate_fallback(ats_score, matched, missing, job_position)
