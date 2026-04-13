"""
SHAP token-level attribution for HateBERT predictions.
Explains which tokens contributed most to the offensive/hate classification.
"""
import shap
import torch
import numpy as np
from grievance_engine.offensiveness import get_model_and_tokenizer

_explainer = None


def _get_explainer():
    global _explainer
    if _explainer is not None:
        return _explainer

    model, tokenizer = get_model_and_tokenizer()

    def predict_proba(texts):
        """Wrapper function for SHAP — returns probability array."""
        inputs = tokenizer(
            list(texts),
            return_tensors="pt",
            truncation=True,
            max_length=128,
            padding=True
        )
        with torch.no_grad():
            logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1).numpy()
        return probs  # shape: (n_texts, 3)

    _explainer = shap.Explainer(predict_proba, tokenizer)
    return _explainer


def get_shap_values(text: str, top_n: int = 10) -> list:
    """
    Compute SHAP token-level scores for offensive class.
    Returns top_n tokens sorted by contribution to offensive/hate prediction.

    Returns: [{"token": str, "shap_score": float}]
    """
    try:
        explainer = _get_explainer()
        shap_values = explainer([text])

        # shap_values.values shape: (1, n_tokens, 3)
        # Index 0=hate, 1=offensive — we take max across both offensive classes
        token_list   = shap_values.data[0]        # list of token strings
        values_hate  = shap_values.values[0, :, 0]  # SHAP for hate class
        values_off   = shap_values.values[0, :, 1]  # SHAP for offensive class

        # Use max contribution across hate+offensive classes
        combined = np.maximum(values_hate, values_off)

        results = []
        for token, score in zip(token_list, combined):
            token_str = str(token).strip()
            # Skip special tokens and tiny fragments
            if token_str in ["[CLS]", "[SEP]", "[PAD]", ""]:
                continue
            if abs(score) < 0.01:
                continue
            results.append({
                "token": token_str,
                "shap_score": round(float(score), 4)
            })

        # Sort by score descending, take top N
        # results.sort(key=lambda x: x["shap_score"], reverse=True)
        return results[:top_n]

    except Exception as e:
        print(f"[SHAP] Error computing SHAP values: {e}")
        return []
