"""PDF parsing module for resume text extraction."""

import io
import re
from typing import Dict, Any


def _clean_text(text: str) -> str:
    """
    Clean extracted text by normalizing whitespace and removing noise.

    Args:
        text: Raw extracted text from PDF.

    Returns:
        Cleaned text with normalized whitespace and line endings.
    """
    if not text:
        return ""

    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        # Remove lines that contain only symbols/punctuation
        stripped = line.strip()
        if stripped and not re.match(r'^[\s\W]+$', stripped):
            # Normalize multiple spaces to single space
            cleaned_line = re.sub(r'[ \t]+', ' ', stripped)
            cleaned_lines.append(cleaned_line)

    # Join with normalized line endings
    cleaned_text = '\n'.join(cleaned_lines)

    # Remove excessive blank lines (more than 2 consecutive)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    return cleaned_text.strip()


def assess_text_quality(text: str) -> float:
    """
    Assess the quality of extracted text based on spacing and word metrics.

    Quality is measured by:
    1. Space ratio (spaces / total chars) - good text has 0.10-0.25
    2. Average word length - good text has 3-12 chars per word
    3. Word count - good resumes have 100+ words

    Args:
        text: Extracted text to assess.

    Returns:
        Quality score from 0.0 to 3.0 (sum of three component scores).
    """
    if not text:
        return 0.0

    total_chars = len(text)
    if total_chars == 0:
        return 0.0

    # Count spaces
    space_count = text.count(' ')
    space_ratio = space_count / total_chars

    # Calculate word count and average word length
    words = text.split()
    word_count = len(words)
    avg_word_length = total_chars / word_count if word_count > 0 else 0

    # Score 1: Space ratio
    # Good text has space ratio between 0.10 and 0.25
    if space_ratio >= 0.10:
        space_score = 1.0
    elif space_ratio >= 0.05:
        space_score = 0.5
    else:
        space_score = 0.0

    # Score 2: Average word length
    # Good text has average word length between 3 and 12
    if 3 <= avg_word_length <= 12:
        length_score = 1.0
    elif avg_word_length <= 15:
        length_score = 0.5
    else:
        length_score = 0.0

    # Score 3: Word count
    # Good resumes have at least 100 words
    if word_count >= 100:
        count_score = 1.0
    elif word_count >= 50:
        count_score = 0.5
    else:
        count_score = 0.0

    return space_score + length_score + count_score


def fix_missing_spaces(text: str) -> str:
    """
    Fix common missing space issues in poorly extracted PDF text.

    Applies regex patterns to fix:
    1. CamelCase splitting (lowercase followed by uppercase)
    2. Missing space after punctuation
    3. Letter-digit boundaries

    Args:
        text: Text with potential spacing issues.

    Returns:
        Text with spacing issues fixed.
    """
    if not text:
        return ""

    # 1. Add space before capital letters that follow lowercase letters
    # e.g., "engineeringSoftware" -> "engineering Software"
    fixed = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)

    # 2. Add space after punctuation if missing
    # e.g., "skills.Python" -> "skills. Python"
    fixed = re.sub(r'([,.:;!?])([a-zA-Z])', r'\1 \2', fixed)

    # 3. Add space between letter and digit sequences
    # e.g., "Python3years" -> "Python 3 years"
    fixed = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', fixed)
    fixed = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', fixed)

    return fixed


def _extract_with_pdfplumber(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF using pdfplumber.

    Args:
        pdf_bytes: Raw PDF file bytes.

    Returns:
        Extracted text string.

    Raises:
        Exception: If pdfplumber fails to extract text.
    """
    import pdfplumber

    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return '\n'.join(text_parts)


def _extract_with_pymupdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF using PyMuPDF (fitz).

    Args:
        pdf_bytes: Raw PDF file bytes.

    Returns:
        Extracted text string.

    Raises:
        Exception: If PyMuPDF fails to extract text.
    """
    import fitz

    text_parts = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    try:
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
    finally:
        doc.close()

    return '\n'.join(text_parts)


def parse_resume_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Parse a resume PDF and extract text content.

    Attempts text extraction using both pdfplumber and PyMuPDF, then
    selects the result with higher quality based on spacing and word metrics.
    Applies post-processing to fix spacing issues if quality is below threshold.

    Args:
        pdf_bytes: Raw PDF file bytes.

    Returns:
        Dictionary containing:
            - raw_text (str): Cleaned extracted text
            - method_used (str): 'pdfplumber', 'pymupdf', or 'none'
            - word_count (int): Number of words in extracted text
            - success (bool): Whether extraction was successful
            - quality_score (float): Quality score of chosen text
            - quality_pdfplumber (float): Quality score from pdfplumber
            - quality_pymupdf (float): Quality score from pymupdf
            - parser_chosen (str): Which parser was selected
            - spaces_fixed (bool): Whether space fixing was applied
    """
    result = {
        "raw_text": "",
        "method_used": "none",
        "word_count": 0,
        "success": False,
        "quality_score": 0.0,
        "quality_pdfplumber": 0.0,
        "quality_pymupdf": 0.0,
        "parser_chosen": "none",
        "spaces_fixed": False
    }

    if not pdf_bytes:
        return result

    # Step 1: Try both parsers
    result_pdfplumber = ""
    result_pymupdf = ""

    try:
        result_pdfplumber = _extract_with_pdfplumber(pdf_bytes)
    except Exception:
        result_pdfplumber = ""

    try:
        result_pymupdf = _extract_with_pymupdf(pdf_bytes)
    except Exception:
        result_pymupdf = ""

    # Step 2: Score each result by quality
    quality_pdfplumber = assess_text_quality(result_pdfplumber)
    quality_pymupdf = assess_text_quality(result_pymupdf)

    result["quality_pdfplumber"] = round(quality_pdfplumber, 2)
    result["quality_pymupdf"] = round(quality_pymupdf, 2)

    # Step 3: Pick the better result
    # If equal, prefer pymupdf
    if quality_pdfplumber > quality_pymupdf:
        extracted_text = result_pdfplumber
        parser_chosen = "pdfplumber"
        quality_score = quality_pdfplumber
    else:
        extracted_text = result_pymupdf
        parser_chosen = "pymupdf"
        quality_score = quality_pymupdf

    result["parser_chosen"] = parser_chosen
    result["quality_score"] = round(quality_score, 2)

    # Clean the extracted text
    cleaned_text = _clean_text(extracted_text)

    # Step 4: Apply space fixing if quality is below 2.0
    spaces_fixed = False
    if quality_score < 2.0 and cleaned_text:
        cleaned_text = fix_missing_spaces(cleaned_text)
        spaces_fixed = True

    result["spaces_fixed"] = spaces_fixed

    # Calculate word count
    word_count = len(cleaned_text.split()) if cleaned_text else 0

    result["raw_text"] = cleaned_text
    result["method_used"] = parser_chosen
    result["word_count"] = word_count
    result["success"] = bool(cleaned_text)

    return result
