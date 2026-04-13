from fastapi import FastAPI
from pydantic import BaseModel
from semantic_engine.pipeline import process_experience as process_raw_text
from grievance_engine.preprocess import preprocess
from grievance_engine.offensiveness import classify_text
from grievance_engine.shap_explain import get_shap_values
from grievance_engine.lexicon import get_lexicon_highlights
from grievance_engine.evolving_lexicon import update_lexicon_if_needed

app = FastAPI()

# ─── Existing Experience Hub endpoint ───────────────────────────────────────

class Request(BaseModel):
    text: str

@app.post("/analyze")
def analyze(req: Request):
    return process_raw_text(req.text)

# ─── Grievance Module endpoint ───────────────────────────────────────────────

class GrievanceRequest(BaseModel):
    text: str

@app.post("/grievance/analyze")
def analyze_grievance(req: GrievanceRequest):
    """
    Analyze a student complaint for offensive/hate language.
    Returns classification label + SHAP token explanations + lexicon hits.
    """
    cleaned       = preprocess(req.text)
    analysis      = classify_text(cleaned)
    shap_tokens   = get_shap_values(cleaned)
    lexicon_hits  = get_lexicon_highlights(cleaned)

    # ─── Hybrid Logic: Lexicon Override ──────────────────────────────────────
    # If the AI says 'neutral' but we found words in our hand-picked lexicon,
    # we upgrade it to 'offensive' to ensure campus-level safety.
    final_label = analysis["label"]
    if final_label == "neutral" and len(lexicon_hits) > 0:
        final_label = "offensive"

    # Evolving lexicon — learns from flagged complaints over time
    update_lexicon_if_needed(shap_tokens, final_label)

    return {
        "label":        final_label,                  # "hate" | "offensive" | "neutral"
        "score":        analysis["score"],            # confidence 0–1
        "all_scores":   analysis["all_scores"],       # original AI probabilities
        "shap_tokens":  shap_tokens,                  # [{token, shap_score}]
        "lexicon_hits": lexicon_hits,                 # [{word, start, end}]
        "ai_label":     analysis["label"]             # show what the AI thought raw
    }
