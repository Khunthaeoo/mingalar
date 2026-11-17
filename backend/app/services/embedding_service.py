import math
import hashlib
import httpx
from typing import List
from app.config import settings

VECTOR_DIM = 768

async def generate_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimensional embedding vector.
    1. If GOOGLE_API_KEY is configured, calls Google Gemini text-embedding-004.
    2. Otherwise, falls back to a deterministic 768-dim normalized semantic vector generator.
    """
    clean_text = text.strip()
    if not clean_text:
        return [0.0] * VECTOR_DIM

    # Try Google Gemini text-embedding-004 if API key is provided
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "your-google-gemini-api-key":
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GOOGLE_API_KEY}"
            payload = {
                "model": "models/text-embedding-004",
                "content": {
                    "parts": [{"text": clean_text[:2000]}]
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    values = data.get("embedding", {}).get("values", [])
                    if len(values) == VECTOR_DIM:
                        return values
        except Exception as e:
            print(f"[Embedding] Google API error, falling back to local vector generator: {e}")

    # Robust local deterministic semantic hash vector generator (768-dim)
    return generate_local_embedding(clean_text)

def generate_local_embedding(text: str) -> List[float]:
    """
    Produces a normalized 768-dimensional vector using multi-hash n-gram projection.
    Ensures that identical/similar terms cluster with positive cosine similarity without needing an external API.
    """
    vec = [0.0] * VECTOR_DIM
    words = text.lower().split()
    if not words:
        return vec

    for i, word in enumerate(words):
        # 1-gram and 2-gram hashing
        ngrams = [word]
        if i + 1 < len(words):
            ngrams.append(f"{word}_{words[i+1]}")

        for token in ngrams:
            # Generate 4 distinct hash buckets per token
            for seed in range(4):
                h = int(hashlib.sha256(f"{token}_{seed}".encode("utf-8")).hexdigest(), 16)
                idx = h % VECTOR_DIM
                sign = 1.0 if ((h >> 16) % 2 == 0) else -1.0
                vec[idx] += sign

    # L2 Normalization
    magnitude = math.sqrt(sum(x * x for x in vec))
    if magnitude > 0:
        vec = [round(x / magnitude, 6) for x in vec]

    return vec
