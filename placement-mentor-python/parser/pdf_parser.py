import pdfplumber
import fitz  # PyMuPDF
import re


def extract_text_with_pdfplumber(pdf_bytes: bytes) -> str:
    """
    Primary PDF text extraction using pdfplumber.
    Works well for most standard resume formats.
    Returns extracted text as a single string.
    """
    text_pages = []

    with pdfplumber.open(pdf_bytes) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_pages.append(page_text)

    return "\n".join(text_pages)


def extract_text_with_pymupdf(pdf_bytes: bytes) -> str:
    """
    Fallback PDF text extraction using PyMuPDF.
    Used when pdfplumber fails or returns empty text.
    Returns extracted text as a single string.
    """
    text_pages = []

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in doc:
        page_text = page.get_text()
        if page_text:
            text_pages.append(page_text)
    doc.close()

    return "\n".join(text_pages)


def clean_text(text: str) -> str:
    """
    Cleans extracted resume text.
    Removes excessive whitespace and noise while
    preserving readable structure.
    """
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove lines that are just symbols or whitespace
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip empty lines and lines that are just symbols
        if not stripped:
            continue
        if re.match(r'^[^a-zA-Z0-9]+$', stripped):
            continue
        cleaned_lines.append(stripped)

    # Join and normalize spaces
    text = "\n".join(cleaned_lines)
    text = re.sub(r' +', ' ', text)

    return text.strip()


def parse_resume_pdf(pdf_bytes: bytes) -> dict:
    """
    Main entry point for PDF parsing.
    Tries pdfplumber first, falls back to PyMuPDF.
    Returns dict with extracted text and method used.
    """
    raw_text = ""
    method_used = ""

    # Try pdfplumber first
    try:
        raw_text = extract_text_with_pdfplumber(pdf_bytes)
        method_used = "pdfplumber"
    except Exception as e:
        print(f"pdfplumber failed: {e}")

    # Fallback to PyMuPDF if pdfplumber returned empty or failed
    if not raw_text or len(raw_text.strip()) < 50:
        try:
            raw_text = extract_text_with_pymupdf(pdf_bytes)
            method_used = "pymupdf"
        except Exception as e:
            print(f"pymupdf failed: {e}")

    # Clean the extracted text
    cleaned = clean_text(raw_text)

    return {
        "raw_text": cleaned,
        "method_used": method_used,
        "word_count": len(cleaned.split()),
        "success": len(cleaned) > 50
    }