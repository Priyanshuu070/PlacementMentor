"""Test script for scorer modules."""

from scorer.coverage_scorer import compute_coverage_score
from scorer.ats_scorer import compute_ats_score

print("=" * 60)
print("SCORER MODULE TEST")
print("=" * 60)

# Sample resume text (realistic)
resume_text = """
John Smith
Software Engineer | Python Developer

SUMMARY
Experienced software engineer with 5 years of expertise in building 
scalable web applications. Passionate about clean code and best practices.

SKILLS
Python, JavaScript, React, Node.js, PostgreSQL, AWS, Docker, Git,
REST APIs, Agile methodologies, Test-Driven Development

EXPERIENCE
Senior Software Engineer | TechCorp Inc | 2021 - Present
- Developed microservices using Python and FastAPI
- Built responsive frontend applications with React
- Deployed applications on AWS using Docker containers
- Collaborated with cross-functional teams in Agile environment

Software Developer | StartupXYZ | 2019 - 2021
- Created RESTful APIs using Node.js and Express
- Managed PostgreSQL databases and optimized queries
- Implemented CI/CD pipelines using GitHub Actions

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019

PROJECTS
E-commerce Platform
- Full-stack application using React and Python backend
- Integrated payment processing with Stripe API

Task Management App
- Built with Node.js, MongoDB, and React
- Real-time updates using WebSocket
"""

# Sample job description text
jd_text = """
Senior Python Developer

We are looking for an experienced Python developer to join our team.

Requirements:
- 4+ years of experience with Python
- Strong knowledge of FastAPI or Django
- Experience with PostgreSQL and database design
- Familiarity with AWS services (EC2, S3, Lambda)
- Experience with Docker and Kubernetes
- Understanding of microservices architecture
- Strong communication skills
- Experience with React is a plus

Responsibilities:
- Design and develop scalable Python applications
- Build and maintain RESTful APIs
- Collaborate with frontend developers
- Deploy applications using Docker and AWS
- Write clean, maintainable code with tests
"""

# Sample matched skills and JD skills
matched_skills = ["python", "postgresql", "aws", "docker", "react", "rest api"]
jd_skills = ["python", "fastapi", "django", "postgresql", "aws", "docker", "kubernetes", "react", "microservices"]

# Sample sections (simulating output from section_parser)
sections = {
    "summary": "Experienced software engineer with 5 years...",
    "skills": "Python, JavaScript, React, Node.js...",
    "experience": "Senior Software Engineer | TechCorp Inc...",
    "education": "Bachelor of Science in Computer Science...",
    "projects": "E-commerce Platform...",
    "certifications": "",
    "full_text": ""
}

# Test 1: Coverage score
print("\n--- Coverage Score Test ---")
coverage = compute_coverage_score(matched_skills, jd_skills)
print(f"Matched skills: {matched_skills}")
print(f"JD skills: {jd_skills}")
print(f"✓ Coverage score: {coverage}%")

# Test 2: Coverage with empty JD
empty_coverage = compute_coverage_score(matched_skills, [])
print(f"✓ Coverage with empty JD: {empty_coverage}%")

# Test 3: Full ATS score
print("\n--- Full ATS Score Test ---")
result = compute_ats_score(
    resume_text=resume_text,
    jd_text=jd_text,
    matched=matched_skills,
    jd_skills=jd_skills,
    sections=sections
)

print(f"\n✓ Final ATS Score: {result['ats_score']}%")
print(f"✓ Coverage Score: {result['coverage_score']}%")
print(f"✓ Word Count: {result['word_count']}")
print(f"✓ Sections Found: {result['sections_found']}")

print("\n--- Component Breakdown ---")
components = result['components']
print(f"  Skill Coverage (60%):  {components['skill_coverage']}%")
print(f"  Keyword Density (20%): {components['keyword_density']}%")
print(f"  Length Score (10%):    {components['length_score']}%")
print(f"  Section Score (10%):   {components['section_score']}%")

print("\n" + "=" * 60)
print("All scorer tests completed!")
print("=" * 60)
