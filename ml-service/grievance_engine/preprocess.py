import re

def preprocess(text: str) -> str:
    """
    Clean complaint text before feeding to HateBERT.
    Preserves casing — HateBERT is case-aware for offensive detection.
    """
    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    # Remove @mentions
    text = re.sub(r'@\w+', '', text)
    # Remove special characters but keep punctuation (! ? . help with context)
    text = re.sub(r'[^\w\s!?.,]', '', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text
