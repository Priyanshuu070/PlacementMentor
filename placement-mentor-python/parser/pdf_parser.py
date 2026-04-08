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

    Attempts text extraction using pdfplumber first, then falls back to
    PyMuPDF (fitz) if pdfplumber fails or returns less than 50 characters.

    Args:
        pdf_bytes: Raw PDF file bytes.

    Returns:
        Dictionary containing:
            - raw_text (str): Cleaned extracted text
            - method_used (str): 'pdfplumber', 'pymupdf', or 'none'
            - word_count (int): Number of words in extracted text
            - success (bool): Whether extraction was successful
    """
    result = {
        "raw_text": "",
        "method_used": "none",
        "word_count": 0,
        "success": False
    }

    if not pdf_bytes:
        return result

    extracted_text = ""
    method_used = "none"

    # Try pdfplumber first
    try:
        extracted_text = _extract_with_pdfplumber(pdf_bytes)
        method_used = "pdfplumber"
    except Exception:
        extracted_text = ""

    # Fallback to PyMuPDF if pdfplumber failed or returned insufficient text
    if len(extracted_text) < 50:
        try:
            pymupdf_text = _extract_with_pymupdf(pdf_bytes)
            if len(pymupdf_text) >= len(extracted_text):
                extracted_text = pymupdf_text
                method_used = "pymupdf"
        except Exception:
            pass

    # Clean the extracted text
    cleaned_text = _clean_text(extracted_text)

    # Calculate word count
    word_count = len(cleaned_text.split()) if cleaned_text else 0

    result["raw_text"] = cleaned_text
    result["method_used"] = method_used
    result["word_count"] = word_count
    result["success"] = bool(cleaned_text)

    return result
