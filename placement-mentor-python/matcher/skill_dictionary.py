"""Skill dictionary module for loading and querying skills data."""

import json
import re
import os
from typing import List, Dict, Any, Optional

# Module-level cache for skill dictionary (loaded once on startup)
_skill_dictionary: List[Dict[str, Any]] = []
_canonical_lookup: Dict[str, str] = {}  # Maps lowercase canonical/alias -> canonical_name
_weight_lookup: Dict[str, int] = {}  # Maps canonical_name -> frequency_weight
_loaded: bool = False


def _get_dictionary_path() -> str:
    """
    Get the path to the skill dictionary JSON file.

    Returns:
        Absolute path to skill_dictionary.json.
    """
    module_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(module_dir)
    return os.path.join(project_root, "data", "skill_dictionary.json")


def _load_dictionary() -> None:
    """
    Load the skill dictionary from JSON file into module-level cache.

    Builds lookup tables for fast canonical name and weight retrieval.
    Called automatically on first access to dictionary functions.
    """
    global _skill_dictionary, _canonical_lookup, _weight_lookup, _loaded

    if _loaded:
        return

    dictionary_path = _get_dictionary_path()

    try:
        with open(dictionary_path, 'r', encoding='utf-8') as f:
            _skill_dictionary = json.load(f)
    except FileNotFoundError:
        _skill_dictionary = []
        _loaded = True
        return
    except json.JSONDecodeError:
        _skill_dictionary = []
        _loaded = True
        return

    # Build lookup tables
    for skill in _skill_dictionary:
        canonical = skill.get("canonical_name", "")
        if not canonical:
            continue

        canonical_lower = canonical.lower()

        # Map canonical name to itself
        _canonical_lookup[canonical_lower] = canonical

        # Map all aliases to canonical name
        aliases = skill.get("aliases", [])
        for alias in aliases:
            alias_lower = alias.lower()
            _canonical_lookup[alias_lower] = canonical

        # Store weight
        _weight_lookup[canonical] = skill.get("frequency_weight", 1)

    _loaded = True


def get_all_skills() -> List[Dict[str, Any]]:
    """
    Get the full list of skill objects from the dictionary.

    Returns:
        List of skill dictionaries, each containing canonical_name,
        aliases, category, subcategory, and frequency_weight.
    """
    _load_dictionary()
    return _skill_dictionary.copy()


def find_canonical(raw_skill: str) -> Optional[str]:
    """
    Find the canonical skill name for a raw skill string.

    Matching is case-insensitive. First checks for exact match against
    canonical names, then checks against all aliases.

    Args:
        raw_skill: Raw skill string to look up (e.g., "ReactJS", "python").

    Returns:
        Canonical skill name if found (e.g., "react", "python"),
        None if no match found.
    """
    _load_dictionary()

    if not raw_skill:
        return None

    raw_lower = raw_skill.strip().lower()

    # Direct lookup in pre-built table
    return _canonical_lookup.get(raw_lower)


def find_canonical_in_text(text: str, skill_name: str) -> bool:
    """
    Check if a skill name appears in text using word boundary matching.

    Uses regex word boundaries to avoid partial matches
    (e.g., "sql" should not match "nosql").

    Args:
        text: Text to search in.
        skill_name: Skill name or alias to search for.

    Returns:
        True if skill is found with word boundaries, False otherwise.
    """
    if not text or not skill_name:
        return False

    # Escape special regex characters in skill name
    escaped = re.escape(skill_name.lower())

    # Use word boundary matching
    pattern = r'\b' + escaped + r'\b'

    try:
        return bool(re.search(pattern, text.lower()))
    except re.error:
        return False


def get_skill_weight(canonical_name: str) -> int:
    """
    Get the frequency weight for a skill by its canonical name.

    Args:
        canonical_name: The canonical skill name (e.g., "python", "react").

    Returns:
        Frequency weight as integer. Defaults to 1 if skill not found.
    """
    _load_dictionary()

    if not canonical_name:
        return 1

    return _weight_lookup.get(canonical_name, 1)


def search_skills_in_text(text: str) -> List[str]:
    """
    Search for all skills mentioned in a text using word boundary matching.

    Checks both canonical names and aliases against the text.
    Returns only unique canonical names.

    Args:
        text: Text to search for skills.

    Returns:
        List of canonical skill names found in the text.
    """
    _load_dictionary()

    if not text:
        return []

    text_lower = text.lower()
    found_skills = set()

    for skill in _skill_dictionary:
        canonical = skill.get("canonical_name", "")
        if not canonical:
            continue

        # Check canonical name
        if find_canonical_in_text(text_lower, canonical):
            found_skills.add(canonical)
            continue

        # Check aliases
        for alias in skill.get("aliases", []):
            if find_canonical_in_text(text_lower, alias):
                found_skills.add(canonical)
                break

    return list(found_skills)
