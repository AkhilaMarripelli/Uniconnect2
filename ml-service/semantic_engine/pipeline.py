from semantic_engine.normalize import normalize_text
from semantic_engine.split import split_into_candidates
from semantic_engine.extract import extract_atomic_units

def process_experience(raw_text: str):
    # --- FULL PICTURE AI LOGGING ---
    print("\n╔═══════════════ EXPERIENCE HUB NLP ENGINE ═══════════════╗")
    print("║ STEP 1: RAW NARRATIVE INGESTION")
    print(f"║ Content: \"{raw_text[:80]}...\"")
    print("║")

    normalized = normalize_text(raw_text)
    candidates = split_into_candidates(normalized)
    
    print("║ STEP 2: spaCy BOUNDARY DETECTION")
    print(f"║ Sentences Detected: {len(candidates)}")
    print("║")

    atomic_units = extract_atomic_units(candidates)

    # Deduplicate while preserving order
    seen = set()
    final = []
    for a in atomic_units:
        if a not in seen:
            seen.add(a)
            final.append(a)

    print("║ STEP 3: SEMANTIC QUESTION EXTRACTION")
    print(f"║ Final Structured Questions: {len(final)}")
    for i, q in enumerate(final[:5]): 
        print(f"║  Q{i+1}: {q}")
    
    print("╚══════════════════════════════════════════════════════════╝\n")

    return final
