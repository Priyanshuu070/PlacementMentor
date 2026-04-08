"""Test script for the /analyse endpoint using requests."""

import sys
import requests

BASE_URL = "http://localhost:8000"

# Test 1: Health check
print("=" * 60)
print("TEST 1: Health Check")
print("=" * 60)
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("✗ Error: Server not running. Start with:")
    print("  cd placement-mentor-python")
    print("  python -m uvicorn main:app --port 8000")
    sys.exit(1)

# Test 2: Analyse endpoint with real PDF
print("\n" + "=" * 60)
print("TEST 2: Analyse Endpoint")
print("=" * 60)

# Get PDF path from command line argument
if len(sys.argv) > 1:
    pdf_path = sys.argv[1]
else:
    print("Usage: python test_endpoint.py <path_to_resume.pdf>")
    print("\nNo PDF provided. Skipping analyse test.")
    sys.exit(0)

print(f"PDF file: {pdf_path}")

try:
    with open(pdf_path, "rb") as f:
        files = {"resume": ("resume.pdf", f, "application/pdf")}
        data = {
            "jd_text": """We are looking for a Backend Developer 
                          with experience in Python, FastAPI, 
                          PostgreSQL, Docker and REST APIs. 
                          Knowledge of Git and Linux is required.""",
            "user_email": "test@test.com",
            "session_id": "test_session_001",
            "domain_name": "backend_developer"
        }
        response = requests.post(
            f"{BASE_URL}/analyse",
            files=files,
            data=data,
            timeout=60
        )
except FileNotFoundError:
    print(f"✗ Error: PDF file not found: {pdf_path}")
    sys.exit(1)

print(f"Status: {response.status_code}")
result = response.json()

if result.get("success"):
    print("\n--- Scores ---")
    print(f"✓ ATS Score: {result['ats_score']}%")
    print(f"✓ Coverage Score: {result['coverage_score']}%")
    print(f"✓ Weight Mode: {result['weight_mode']}")
    print(f"✓ Score Capped: {result['score_capped']}")

    print("\n--- Component Scores ---")
    print(f"  Skills Score: {result['skills_score']}%")
    print(f"  Semantic Score: {result['semantic_score']}%")
    print(f"  Experience Score: {result['experience_score']}%")
    print(f"  Structure Score: {result['structure_score']}%")

    print("\n--- Job & Parsing ---")
    print(f"✓ Job Position: {result['job_position']}")
    print(f"✓ Parser Used: {result['parser_used']}")
    print(f"✓ Word Count: {result['word_count']}")
    print(f"✓ Sections Found: {result['sections_found']}")

    print("\n--- Skills Analysis ---")
    print(f"✓ Resume Skills ({len(result['detected_skills_resume'])}): {result['detected_skills_resume']}")
    print(f"✓ JD Skills ({len(result['detected_skills_jd'])}): {result['detected_skills_jd']}")
    print(f"✓ Contextual Skills: {result['contextual_skills']}")
    print(f"✓ Isolated Skills: {result['isolated_skills']}")
    print(f"✓ Skill Gaps: {result['skill_gaps']}")
    print(f"✓ Extra Skills: {result['extra_skills']}")

    print("\n--- Domain Score ---")
    domain_score = result.get('domain_score')
    if domain_score:
        print(f"✓ Domain Match: {domain_score.get('domain_match_score')}%")
        print(f"  Clusters: {domain_score.get('clusters_satisfied')}/{domain_score.get('total_clusters')}")
    else:
        print("  No domain score available")

    print(f"\n--- Suggestions ({len(result['suggestions'])}) ---")
    for s in result['suggestions']:
        print(f"  • {s}")

    print(f"\n--- Explanation ---")
    print(f"  {result['explanation']}")

    print(f"\n--- Metadata ---")
    print(f"  User Email: {result['user_email']}")
    print(f"  Session ID: {result['session_id']}")
    print(f"  Domain Name: {result['domain_name']}")

    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    print("=" * 60)
else:
    print(f"✗ Error: {result.get('error')}")
