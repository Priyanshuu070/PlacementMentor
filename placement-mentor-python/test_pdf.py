"""Test script for full PDF parsing pipeline."""

import sys
from parser.pdf_parser import parse_resume_pdf
from parser.section_parser import extract_sections
from matcher.skill_matcher import extract_skills_from_text

# Accept PDF path as command line argument
if len(sys.argv) < 2:
    print("Usage: python test_pdf.py <path_to_resume.pdf>")
    sys.exit(1)

pdf_path = sys.argv[1]

# Read PDF file
with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

# Step 1: Parse PDF
print("=" * 60)
print("PDF PARSING")
print("=" * 60)
result = parse_resume_pdf(pdf_bytes)
print(f"Success: {result['success']}")
print(f"\n--- Parser Comparison ---")
print(f"Quality (pdfplumber): {result['quality_pdfplumber']}")
print(f"Quality (pymupdf):    {result['quality_pymupdf']}")
print(f"Parser chosen:        {result['parser_chosen']}")
print(f"Final quality score:  {result['quality_score']}")
print(f"Spaces fixed:         {result['spaces_fixed']}")
print(f"Word count:           {result['word_count']}")

print(f"\n--- Extracted Text Preview ---")
print(f"First 500 characters:")
print("-" * 40)
print(result['raw_text'][:500])
print("-" * 40)
print(f"\nLast 200 characters:")
print("-" * 40)
print(result['raw_text'][-200:])
print("-" * 40)

# Step 2: Section detection
print("\n" + "=" * 60)
print("SECTION DETECTION")
print("=" * 60)
sections = extract_sections(result['raw_text'])
for section_name in ["skills", "experience", 
                      "projects", "education", "summary"]:
    content = sections.get(section_name, "")
    word_count = len(content.split()) if content else 0
    status = "✓" if content.strip() else "✗"
    print(f"  {status} {section_name}: {word_count} words")

# Step 3: Skill extraction
print("\n" + "=" * 60)
print("SKILL EXTRACTION")
print("=" * 60)
all_skills = extract_skills_from_text(result['raw_text'])
print(f"Total skills found: {len(all_skills)}")
print(f"Skills: {sorted(all_skills)}")

# Step 4: Zone based extraction
print("\n" + "=" * 60)
print("ZONE ANALYSIS")
print("=" * 60)
zone_a = sections.get("experience","") + sections.get("projects","")
zone_b = sections.get("skills","") + sections.get("summary","")
zone_a_skills = extract_skills_from_text(zone_a)
zone_b_skills = extract_skills_from_text(zone_b)
print(f"Zone A skills (experience+projects): {sorted(zone_a_skills)}")
print(f"Zone B skills (skills+summary): {sorted(zone_b_skills)}")
contextual = [s for s in zone_a_skills]
isolated = [s for s in zone_b_skills if s not in zone_a_skills]
print(f"\nContextual (demonstrated): {sorted(contextual)}")
print(f"Isolated (listed only): {sorted(isolated)}")
