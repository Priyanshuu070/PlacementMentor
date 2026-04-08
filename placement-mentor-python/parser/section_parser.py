"""Section parsing module for extracting resume sections."""

import re
from typing import Dict, List, Tuple


# Section keywords for detection (case-insensitive matching)
SECTION_KEYWORDS = {
    "skills": [
        "skills", "technical skills", "core skills", "key skills",
        "competencies", "technologies", "tech stack"
    ],
    "experience": [
        "experience", "work experience", "employment", "professional experience",
        "work history", "employment history", "career history"
    ],
    "projects": [
        "projects", "personal projects", "academic projects", "key projects",
        "project experience", "project work"
    ],
    "education": [
        "education", "academic background", "qualifications",
        "educational background", "academic qualifications", "academics"
    ],
    "summary": [
        "summary", "professional summary", "objective", "career objective",
        "profile", "about me", "about", "career summary", "overview"
    ],
    "certifications": [
        "certifications", "certificates", "certification", "certificate",
        "licenses", "credentials", "professional certifications"
    ],
    "internships": [
        "internships", "internship", "internship experience", "training"
    ]
}


def _normalize_line(line: str) -> str:
    """
    Normalize a line for section header matching.

    Args:
        line: Raw line from resume text.

    Returns:
        Lowercase, stripped line without trailing punctuation.
    """
    normalized = line.strip().lower()
    # Remove trailing colons, dashes, or other punctuation
    normalized = re.sub(r'[:\-–—]+\s*$', '', normalized)
    return normalized.strip()


def _detect_section_headers(text: str) -> List[Tuple[str, int, int]]:
    """
    Detect section headers and their positions in the text.

    Args:
        text: Resume text to analyze.

    Returns:
        List of tuples containing (section_name, start_index, line_end_index)
        sorted by position in text.
    """
    headers = []
    lines = text.split('\n')
    current_pos = 0

    for line in lines:
        line_start = current_pos
        line_end = current_pos + len(line)

        normalized = _normalize_line(line)

        # Skip empty lines or very long lines (unlikely to be headers)
        if not normalized or len(normalized) > 50:
            current_pos = line_end + 1  # +1 for newline
            continue

        # Check each section type
        for section_name, keywords in SECTION_KEYWORDS.items():
            for keyword in keywords:
                # Match if line equals keyword or starts with keyword
                if normalized == keyword or normalized.startswith(keyword + " "):
                    headers.append((section_name, line_start, line_end))
                    break
            else:
                continue
            break

        current_pos = line_end + 1  # +1 for newline

    # Sort by position
    headers.sort(key=lambda x: x[1])

    return headers


def _extract_section_text(text: str, start: int, end: int) -> str:
    """
    Extract and clean section text between two positions.

    Args:
        text: Full resume text.
        start: Start position (after header line).
        end: End position (start of next section or end of text).

    Returns:
        Cleaned section text.
    """
    section_text = text[start:end].strip()
    return section_text


def extract_sections(text: str) -> Dict[str, str]:
    """
    Extract sections from resume text based on keyword matching.

    Detects common resume sections (skills, experience, projects, education,
    summary, certifications) by matching header lines against known keywords.
    Each section's content includes everything from the header until the next
    detected section header.

    Args:
        text: Full resume text to parse.

    Returns:
        Dictionary containing:
            - skills (str): Skills section content
            - experience (str): Experience section content
            - projects (str): Projects section content
            - education (str): Education section content
            - summary (str): Summary/objective section content
            - certifications (str): Certifications section content
            - full_text (str): Original full text if no sections detected,
                              otherwise empty string
    """
    result = {
        "skills": "",
        "experience": "",
        "projects": "",
        "education": "",
        "summary": "",
        "certifications": "",
        "internships": "",
        "full_text": ""
    }

    if not text or not text.strip():
        return result

    # Detect section headers
    headers = _detect_section_headers(text)

    # If no sections detected, return full text
    if not headers:
        result["full_text"] = text.strip()
        return result

    # Extract each section's content
    for i, (section_name, header_start, header_end) in enumerate(headers):
        # Content starts after the header line
        content_start = header_end + 1

        # Content ends at start of next section or end of text
        if i + 1 < len(headers):
            content_end = headers[i + 1][1]
        else:
            content_end = len(text)

        section_text = _extract_section_text(text, content_start, content_end)

        # Only update if we haven't already found this section
        # (keeps the first occurrence)
        if not result[section_name]:
            result[section_name] = section_text

    return result
