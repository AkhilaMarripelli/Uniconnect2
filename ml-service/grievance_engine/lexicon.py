import os
import re

LEXICON_PATH = os.path.join(os.path.dirname(__file__), "offensive_lexicon.txt")

def _load_lexicon() -> set:
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        return set(line.strip().lower() for line in f if line.strip())

# Load once at startup
_LEXICON = _load_lexicon()

def reload_lexicon():
    """Call this after evolving_lexicon updates the file."""
    global _LEXICON
    _LEXICON = _load_lexicon()

def get_lexicon_highlights(text: str) -> list:
    """
    Scan text and return list of words found in the offensive lexicon.
    Returns: [{"word": str, "start": int, "end": int}]
    """
    hits = []
    # Tokenize by word boundaries — preserve original indices
    for match in re.finditer(r'\b\w+\b', text):
        word = match.group()
        if word.lower() in _LEXICON:
            hits.append({
                "word": word,
                "start": match.start(),
                "end": match.end()
            })
    return hits

def get_lexicon_set() -> set:
    return _LEXICON
