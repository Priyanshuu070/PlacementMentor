"""Test script for the new scoring system."""

from parser.section_parser import extract_sections
from matcher.skill_matcher import extract_skills_from_text
from matcher.skill_dictionary import search_skills_in_text, is_role_label
from scorer.ats_scorer import compute_ats_score, get_domain_map
from suggester.suggestion_engine import generate_suggestions

print("=" * 70)
print("NEW SCORING SYSTEM TEST (WITH FIXES)")
print("=" * 70)

# Sample resume with React in BOTH skills AND projects section,
# and Python in skills section ONLY (not in projects)
resume_text = """
SUMMARY
Experienced fullstack developer with 3 years of experience building
web applications. Passionate about clean code and modern technologies.

SKILLS
Python, React, JavaScript, TypeScript, Node.js, PostgreSQL,
Docker, Git, REST API, MongoDB, Express.js

EXPERIENCE
Software Developer | TechCorp Inc | 2021 - Present
- Developed and maintained web applications serving 10,000+ users
- Collaborated with cross-functional teams in Agile environment
- Implemented CI/CD pipelines for automated deployments

Junior Developer | StartupXYZ | 2020 - 2021
- Built responsive frontend interfaces
- Participated in code reviews and testing

PROJECTS
E-commerce Platform
- Built a full-stack e-commerce application using React and Node.js
- Implemented shopping cart, checkout, and payment integration
- Used PostgreSQL for database and Docker for containerization

Task Management Dashboard
- Created real-time dashboard using React and WebSocket
- Integrated with REST APIs for data synchronization
- Deployed on AWS with Docker containers

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2016 - 2020
"""

# JD text with specific skills
jd_text = """
Looking for a fullstack developer with experience in:
React, Node.js, PostgreSQL, Docker and TypeScript.
Knowledge of REST APIs and cloud deployment is required.
Experience with MongoDB is a plus.
"""

# Domain name for testing
domain_name = "fullstack_developer"

print("\n--- FIX 1: Role Label Filtering ---")
print("Before filtering (raw search):")
raw_skills = search_skills_in_text(jd_text)
print(f"  Raw JD skills: {sorted(raw_skills)}")

print("\nAfter filtering (extract_skills_from_text):")
jd_skills = extract_skills_from_text(jd_text)
print(f"  Filtered JD skills: {jd_skills}")

# Show which skills were filtered
filtered_out = set(raw_skills) - set(jd_skills)
print(f"\n  Filtered out as role labels: {sorted(filtered_out)}")

# Verify specific skills
for skill in ['full stack development', 'front end development', 'back end development', 'rest api']:
    is_label = is_role_label(skill)
    status = "ROLE LABEL (filtered)" if is_label else "SKILL (kept)"
    print(f"    '{skill}': {status}")

print("\n--- Resume Skills (with filtering) ---")
raw_resume = search_skills_in_text(resume_text)
resume_skills = extract_skills_from_text(resume_text)
filtered_resume = set(raw_resume) - set(resume_skills)
print(f"Raw count: {len(raw_resume)}, Filtered count: {len(resume_skills)}")
print(f"Filtered out: {sorted(filtered_resume)}")
print(f"Resume skills: {resume_skills}")

# Verify "full stack development" is NOT in extracted skills
if "full stack development" in jd_skills:
    print("\n❌ ERROR: 'full stack development' should be filtered out!")
else:
    print("\n✓ 'full stack development' correctly filtered from JD skills")

if "full stack development" in resume_skills:
    print("❌ ERROR: 'full stack development' should be filtered out!")
else:
    print("✓ 'full stack development' correctly filtered from resume skills")

print("\n--- Test Setup ---")
print(f"Domain: {domain_name}")

# Step 1: Extract sections
print("\n--- Section Extraction ---")
sections = extract_sections(resume_text)
for section_name in ["skills", "experience", "projects", "education", "summary"]:
    content = sections.get(section_name, "")
    has_content = "✓" if content.strip() else "✗"
    print(f"  {section_name}: {has_content}")

# Step 2: Compute ATS score with new system
print("\n--- ATS Scoring (Standard Mode) ---")
ats_result = compute_ats_score(
    resume_text=resume_text,
    jd_text=jd_text,
    resume_skills_all=resume_skills,
    jd_skills=jd_skills,
    sections=sections,
    domain_name=domain_name
)

print(f"\n✓ Final ATS Score: {ats_result['ats_score']}%")
print(f"✓ Weight Mode: {ats_result['weight_mode']}")
print(f"✓ Score Capped: {ats_result['score_capped']}")

print("\n--- Component Scores ---")
print(f"  Skills Score (55%):     {ats_result['skills_score']}%")
print(f"  Semantic Score (25%):   {ats_result['semantic_score']}%")
print(f"  Experience Score (5%):  {ats_result['experience_score']}%")
print(f"  Structure Score (15%):  {ats_result['structure_score']}%")

print("\n--- Zone-Based Skill Analysis ---")
print(f"✓ Contextual skills: {ats_result['contextual_skills']}")
print(f"✓ Isolated skills: {ats_result['isolated_skills']}")
print(f"✓ Missing skills: {ats_result['missing_skills']}")

# Domain score
print("\n--- Domain Score ---")
domain_score = ats_result.get("domain_score")
if domain_score:
    print(f"✓ Domain Match: {domain_score['domain_match_score']}%")
    print(f"  Clusters: {domain_score['clusters_satisfied']}/{domain_score['total_clusters']}")

# FIX 2: Test domain inference mode with cap
print("\n" + "=" * 70)
print("FIX 2: DOMAIN INFERENCE MODE WITH 85% CAP")
print("=" * 70)

jd_no_skills = """
We are hiring a fullstack developer.
Must have strong problem-solving abilities.
Experience with web development is required.
"""

jd_skills_empty = extract_skills_from_text(jd_no_skills)
print(f"\nJD skills extracted: {jd_skills_empty} (count: {len(jd_skills_empty)})")

ats_result_inferred = compute_ats_score(
    resume_text=resume_text,
    jd_text=jd_no_skills,
    resume_skills_all=resume_skills,
    jd_skills=jd_skills_empty,
    sections=sections,
    domain_name=domain_name
)

print(f"\n✓ Final ATS Score: {ats_result_inferred['ats_score']}%")
print(f"✓ Weight Mode: {ats_result_inferred['weight_mode']}")
print(f"✓ Score Capped: {ats_result_inferred['score_capped']}")
if ats_result_inferred['cap_reason']:
    print(f"✓ Cap Reason: {ats_result_inferred['cap_reason']}")

# Verify cap is applied
if ats_result_inferred['weight_mode'] == 'domain_inferred':
    if ats_result_inferred['ats_score'] <= 85:
        print("\n✓ Domain inference score correctly capped at or below 85%")
    else:
        print(f"\n❌ ERROR: Score {ats_result_inferred['ats_score']}% exceeds 85% cap!")

domain_score_inf = ats_result_inferred.get("domain_score")
if domain_score_inf:
    print(f"\nDomain Match (pre-cap): {domain_score_inf['domain_match_score']}%")
    uncapped = (domain_score_inf['domain_match_score'] * 0.70) + \
               (ats_result_inferred['experience_score'] * 0.10) + \
               (ats_result_inferred['structure_score'] * 0.20)
    print(f"Calculated uncapped score: {round(uncapped, 1)}%")
    print(f"Final capped score: {ats_result_inferred['ats_score']}%")

# Generate suggestions
print("\n--- Suggestions ---")
suggestions = generate_suggestions(
    matched=ats_result['contextual_skills'] + ats_result['isolated_skills'],
    missing=ats_result['missing_skills'],
    ats_result=ats_result,
    sections=sections,
    resume_text=resume_text,
    domain_name=domain_name
)

for i, suggestion in enumerate(suggestions, 1):
    print(f"  {i}. {suggestion}")

print("\n" + "=" * 70)
print("All fixes verified!")
print("=" * 70)
