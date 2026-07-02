import numpy as np
from typing import List

# Cache loaded sentence transformer models
_model_cache = {}

def get_model(model_name: str):
    """
    Safely loads and caches a sentence-transformers model.
    Falls back to None if sentence-transformers is not installed or errors.
    """
    # Standardize name
    clean_name = "sentence-transformers/all-MiniLM-L6-v2"
    if "mpnet" in model_name.lower():
      clean_name = "sentence-transformers/all-mpnet-base-v2"

    if clean_name in _model_cache:
        return _model_cache[clean_name], clean_name
        
    try:
        from sentence_transformers import SentenceTransformer
        print(f"Loading embedding model: {clean_name}...")
        model = SentenceTransformer(clean_name)
        _model_cache[clean_name] = model
        return model, clean_name
    except Exception as e:
        print(f"Failed to load sentence-transformer model {clean_name}: {str(e)}")
        return None, clean_name

def generate_mock_embedding(text: str, dimensions: int) -> List[float]:
    """
    Generates a deterministic pseudo-semantic vector based on word counts 
    to act as a backend fallback when sentence-transformers is unavailable.
    """
    # Deterministic seed based on string sum to keep positions stable
    seed = sum(ord(c) for c in text) % 10000
    rng = np.random.default_rng(seed)
    
    # Topic Centroids definitions in mock space
    # We define 5 centroids (index 0 to 4) representing our 5 topics:
    # 0: Attention/Paper, 1: NDA/Legal, 2: Medical, 3: Wikipedia/RAG, 4: Python/Decorator
    centroids = {
        "attention": rng.normal(0.6, 0.2, dimensions),
        "agreement": rng.normal(-0.5, 0.3, dimensions),
        "cardiology": rng.normal(0.1, 0.4, dimensions),
        "retrieval": rng.normal(-0.2, 0.2, dimensions),
        "decorator": rng.normal(0.4, -0.3, dimensions)
      }
    
    # Classify text against keywords
    text_lower = text.lower()
    weights = {
        "attention": text_lower.count("attention") + text_lower.count("transformer") + text_lower.count("model") * 0.2,
        "agreement": text_lower.count("agreement") + text_lower.count("confidential") + text_lower.count("discloser") * 0.5,
        "cardiology": text_lower.count("heart") + text_lower.count("cardiology") + text_lower.count("pain") * 0.5,
        "retrieval": text_lower.count("retrieval") + text_lower.count("rag") + text_lower.count("vector") * 0.4,
        "decorator": text_lower.count("decorator") + text_lower.count("wrapper") + text_lower.count("closure") * 0.5,
    }
    
    # Normalise weights
    total_w = sum(weights.values())
    vector = np.zeros(dimensions)
    
    if total_w > 0:
        for k, w in weights.items():
            vector += (w / total_w) * centroids[k]
        # Add small individual noise
        vector += rng.normal(0, 0.15, dimensions)
    else:
        # Standard noise vector
        vector = rng.normal(0, 0.5, dimensions)
        
    # Normalise to unit sphere for cosine similarity consistency
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
        
    return vector.tolist()

def embed_texts(texts: List[str], model_name: str) -> List[List[float]]:
    """
    Converts list of texts into embedding arrays.
    """
    model, clean_name = get_model(model_name)
    dimensions = 768 if "mpnet" in clean_name else 384
    
    if model is not None:
        try:
            embeddings = model.encode(texts)
            # Normalise each vector for cosine similarities
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            normalized = embeddings / np.where(norms == 0, 1, norms)
            return normalized.tolist()
        except Exception as e:
            print(f"Runtime error during model inference: {str(e)}. Falling back to mock embeddings.")
            
    # Fallback mock generators
    return [generate_mock_embedding(text, dimensions) for text in texts]
