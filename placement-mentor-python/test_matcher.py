"""Test script for skill matcher modules."""

from matcher.skill_dictionary import get_all_skills, find_canonical, get_skill_weight
from matcher.skill_matcher import extract_skills_from_text, match_skills

print("=" * 50)
print("SKILL MATCHER TEST")
print("=" * 50)

# Test 1: Load skill dictionary and count
all_skills = get_all_skills()
print(f"\n✓ Loaded skill dictionary: {len(all_skills)} skills")

# Test 2: Extract skills from sample text
sample_text = """
Experienced in Python, ReactJS, and Node.js.
Worked with PostgreSQL and AWS. Built REST APIs.
"""

print(f"\nSample text:\n{sample_text}")

extracted = extract_skills_from_text(sample_text)
print(f"✓ Extracted skills: {extracted}")

# Test 3: Check canonical name lookups
print("\n--- Canonical Name Lookups ---")
test_cases = ["ReactJS", "python", "Node.js", "PostgreSQL", "AWS"]
for raw in test_cases:
    canonical = find_canonical(raw)
    weight = get_skill_weight(canonical) if canonical else 0
    print(f"  '{raw}' -> canonical: '{canonical}', weight: {weight}")

# Test 4: Match skills between resume and JD
print("\n--- Skill Matching ---")
resume_skills = ["python", "react", "node.js", "postgresql", "aws", "rest api"]
jd_skills = ["python", "react", "docker", "kubernetes", "aws", "mongodb"]

result = match_skills(resume_skills, jd_skills)
print(f"Resume skills: {resume_skills}")
print(f"JD skills:     {jd_skills}")
print(f"\n✓ Matched: {result['matched']}")
print(f"✓ Missing (in JD, not in resume): {result['missing']}")
print(f"✓ Extra (in resume, not in JD): {result['extra']}")

print("\n" + "=" * 50)
print("All matcher tests completed!")
print("=" * 50)
