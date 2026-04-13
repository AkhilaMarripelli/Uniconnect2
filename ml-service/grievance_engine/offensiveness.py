"""
HateBERT fine-tuned on Davidson Hate Speech dataset.
Labels: 0=hate, 1=offensive, 2=neutral
"""
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model")

LABEL_MAP = {0: "hate", 1: "offensive", 2: "neutral"}

# ─── Lazy-load model (loaded once at first call) ────────────────────────────
_tokenizer = None
_model = None

def _load_model():
    global _tokenizer, _model
    if _model is not None:
        return

    if os.path.exists(MODEL_PATH):
        # Load fine-tuned model if available
        print("[Grievance] Loading fine-tuned HateBERT from saved_model/")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    else:
        # Fallback: use base HateBERT from HuggingFace (pretrained, not fine-tuned)
        print("[Grievance] Fine-tuned model not found. Loading base GroNLP/hateBERT from HuggingFace.")
        _tokenizer = AutoTokenizer.from_pretrained("GroNLP/hateBERT")
        _model = AutoModelForSequenceClassification.from_pretrained(
            "GroNLP/hateBERT",
            num_labels=3,
            ignore_mismatched_sizes=True
        )

    _model.eval()


def classify_text(text: str) -> dict:
    """
    Classify complaint text as hate / offensive / neutral.
    Returns: {"label": str, "score": float, "all_scores": dict}
    """
    _load_model()

    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=True
    )

    with torch.no_grad():
        outputs = _model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)[0]

    predicted_idx = probs.argmax().item()
    all_scores = {LABEL_MAP[i]: round(probs[i].item(), 4) for i in range(3)}

    return {
        "label": LABEL_MAP[predicted_idx],
        "score": round(probs[predicted_idx].item(), 4),
        "all_scores": all_scores
    }


def get_model_and_tokenizer():
    """Expose model and tokenizer for SHAP explainer."""
    _load_model()
    return _model, _tokenizer
