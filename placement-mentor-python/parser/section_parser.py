import re


# Section header keywords to look for
SECTION_KEYWORDS = {
    "skills": [
        "skills", "technical skills", "core competencies",
        "technologies", "tech stack", "tools", "expertise"
    ],
    "experience": [
        "experience", "work experience", "employment",
        "internship", "internships", "work history",
        "professional experience", "industry experience"
    ],
    "projects": [
        "projects", "personal projects", "academic projects",
        "project work", "key projects", "notable projects"
    ],
    "education": [
        "education", "academic background", "qualifications",
        "academic qualifications", "educational background"
    ],
    "summary": [
        "summary", "objective", "about me", "profile",
        "career objective", "professional summary"
    ],
    "certifications": [
        "certifications", "certificates", "courses",
        "achievements", "awards"
    ]
}


def find_section_boundaries(text: str) -> dict:
    """
    Finds the start index of each section in the resume text.
    Uses keyword matching on individual lines.
    Returns dict mapping section name to character index.
    """
    lines = text.split("\n")
    boundaries = {}

    current_index = 0
    for line in lines:
        normalized = line.strip().lower()
        for section, keywords in SECTION_KEYWORDS.items():
            if normalized in keywords or any(
                normalized == kw or normalized.startswith(kw + ":")
                for kw in keywords
            ):
                if section not in boundaries:
                    boundaries[section] = current_index
                break
        current_index += len(line) + 1  # +1 for newline

    return boundaries


def extract_sections(text: str) -> dict:
    """
    Splits resume text into named sections.
    Falls back to returning full text under 'full_text'
    if no sections are detected.
    Returns dict with section names as keys and text as values.
    """
    boundaries = find_section_boundaries(text)

    if not boundaries:
        # No sections found — treat entire text as one block
        return {
            "full_text": text,
            "skills": "",
            "experience": "",
            "projects": "",
            "education": "",
            "summary": ""
        }

    # Sort sections by their position in the document
    sorted_sections = sorted(boundaries.items(), key=lambda x: x[1])

    sections = {}
    for i, (section_name, start_idx) in enumerate(sorted_sections):
        # End index is start of next section or end of text
        if i + 1 < len(sorted_sections):
            end_idx = sorted_sections[i + 1][1]
        else:
            end_idx = len(text)

        sections[section_name] = text[start_idx:end_idx].strip()

    # Ensure all expected keys exist even if not found
    for section in ["skills", "experience", "projects", "education", "summary"]:
        if section not in sections:
            sections[section] = ""

    sections["full_text"] = text
    return sections