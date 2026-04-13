"""
Evolving Lexicon — Novel Contribution.

Tracks high-SHAP tokens across flagged complaints.
If a token appears with SHAP score > 0.5 in 3+ flagged complaints,
it is automatically added to the offensive lexicon.

This makes the lexicon adaptive and domain-specific over time.
"""
import os
import json
from collections import defaultdict

LEXICON_PATH    = os.path.join(os.path.dirname(__file__), "offensive_lexicon.txt")
TRACKER_PATH    = os.path.join(os.path.dirname(__file__), "shap_token_tracker.json")

SHAP_THRESHOLD  = 0.5   # minimum score to track a token
COUNT_THRESHOLD = 3     # how many times it must appear before adding to lexicon


def _load_tracker() -> dict:
    if os.path.exists(TRACKER_PATH):
        with open(TRACKER_PATH, "r") as f:
            return json.load(f)
    return {}


def _save_tracker(tracker: dict):
    with open(TRACKER_PATH, "w") as f:
        json.dump(tracker, f, indent=2)


def update_lexicon_if_needed(shap_tokens: list, label: str):
    """
    Called after each complaint analysis.
    Only tracks tokens from flagged (hate/offensive) complaints.

    shap_tokens: [{"token": str, "shap_score": float}]
    label: "hate" | "offensive" | "neutral"
    """
    if label == "neutral":
        return  # Only learn from offensive/hate content

    tracker = _load_tracker()
    newly_added = []

    # Load current lexicon to avoid duplicates
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        current_lexicon = set(line.strip().lower() for line in f if line.strip())

    for item in shap_tokens:
        token = item["token"].lower().strip()
        score = item["shap_score"]

        # Skip punctuation, short tokens, already in lexicon
        if len(token) < 3 or not token.isalpha():
            continue
        if token in current_lexicon:
            continue
        if score < SHAP_THRESHOLD:
            continue

        # Track count
        tracker[token] = tracker.get(token, 0) + 1

        # If threshold reached → add to lexicon
        if tracker[token] >= COUNT_THRESHOLD:
            newly_added.append(token)

    if newly_added:
        with open(LEXICON_PATH, "a", encoding="utf-8") as f:
            for word in newly_added:
                f.write(f"\n{word}")
        print(f"[EvolvingLexicon] Added {len(newly_added)} new words: {newly_added}")

        # Reload lexicon in memory
        from grievance_engine.lexicon import reload_lexicon
        reload_lexicon()

    _save_tracker(tracker)
