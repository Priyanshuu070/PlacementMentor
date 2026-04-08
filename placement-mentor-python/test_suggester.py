"""Test script for suggester modules."""

import os

from suggester.suggestion_engine import generate_suggestions
from suggester.explainer import generate_explanation

print("=" * 60)
print("SUGGESTER MODULE TEST")
print("=" * 60)

# Sample data
matched_skills = ["python", "postgresql", "aws", "docker", "react"]
missing_skills = ["kubernetes", "fastapi", "django", "mongodb", "terraform", "graphql", "redis"]

ats_components = {
    "skill_coverage": 55.0,
    "keyword_density": 45.0,
    "length_score": 60.0,
    "section_score": 80.0
}

sections = {
    "summary": "Experienced software engineer...",
    "skills": "Python, React, AWS...",
    "experience": "Senior Developer at TechCorp...",
    "education": "",  # Empty to trigger suggestion
    "projects": "E-commerce platform...",
    "certifications": "",
    "full_text": ""
}

resume_text = """
Experienced software engineer with expertise in Python and cloud technologies.
Built scalable applications using React and PostgreSQL. Deployed on AWS.
""" * 5  # ~250 words

# Test 1: Generate suggestions
print("\n--- Suggestion Engine Test ---")
suggestions = generate_suggestions(
    matched=matched_skills,
    missing=missing_skills,
    ats_components=ats_components,
    sections=sections,
    resume_text=resume_text
)

print(f"Generated {len(suggestions)} suggestions:\n")
for i, suggestion in enumerate(suggestions, 1):
    print(f"  {i}. {suggestion}")

# Test 2: Test with low coverage score
print("\n--- Low Coverage Score Test ---")
low_coverage_components = {
    "skill_coverage": 25.0,
    "keyword_density": 30.0,
    "length_score": 20.0,
    "section_score": 40.0
}
empty_sections = {
    "summary": "",
    "skills": "",
    "experience": "",
    "education": "",
    "projects": "",
    "certifications": "",
    "full_text": ""
}
short_resume = "Brief resume with minimal content."

low_suggestions = generate_suggestions(
    matched=["python"],
    missing=missing_skills,
    ats_components=low_coverage_components,
    sections=empty_sections,
    resume_text=short_resume
)

print(f"Generated {len(low_suggestions)} suggestions for weak resume:\n")
for i, suggestion in enumerate(low_suggestions, 1):
    print(f"  {i}. {suggestion}")

# Test 3: Explainer with fake API key (should use fallback)
print("\n--- Explainer Fallback Test ---")
# Ensure no real API key is set for this test
os.environ.pop("OPENROUTER_API_KEY", None)

explanation = generate_explanation(
    ats_score=67.5,
    coverage_score=55.0,
    matched=matched_skills,
    missing=missing_skills,
    job_position="Senior Python Developer",
    components=ats_components
)

print("Explanation (fallback mode):")
print(f"  {explanation}")

# Test 4: Explainer with invalid API key (should also fallback)
print("\n--- Explainer Invalid API Key Test ---")
os.environ["OPENROUTER_API_KEY"] = "fake_key_for_testing"

explanation_invalid = generate_explanation(
    ats_score=72.4,
    coverage_score=65.0,
    matched=matched_skills,
    missing=["kubernetes", "terraform"],
    job_position="Cloud Engineer",
    components=ats_components
)

print("Explanation (with invalid key, should fallback):")
print(f"  {explanation_invalid}")

# Clean up
os.environ.pop("OPENROUTER_API_KEY", None)

print("\n" + "=" * 60)
print("All suggester tests completed!")
print("=" * 60)
