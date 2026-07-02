import numpy as np
import re
from typing import List, Dict, Any, Tuple

def compute_cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """
    Computes cosine similarity between two vectors.
    """
    arr1 = np.array(v1)
    arr2 = np.array(v2)
    
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return float(np.dot(arr1, arr2) / (norm1 * norm2))

def compute_euclidean_distance(v1: List[float], v2: List[float]) -> float:
    """
    Computes Euclidean distance between two vectors.
    """
    return float(np.linalg.norm(np.array(v1) - np.array(v2)))

def calculate_semantic_metrics(embeddings: List[Dict[str, Any]], k: int = 3) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Calculates K-nearest neighbors, semantic density, and overall cluster metrics
    (cohesion, separation, entropy) to help build semantic indicators.
    """
    if not embeddings:
        return {}, []
        
    n = len(embeddings)
    ids = [item["id"] for item in embeddings]
    vectors = np.array([item["vector"] for item in embeddings])
    
    # Calculate all-to-all cosine similarity matrix
    # Since vectors are normalised, sim = dot(V, V.T)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norm_vectors = vectors / np.where(norms == 0, 1, norms)
    sim_matrix = np.dot(norm_vectors, norm_vectors.T)
    
    # Build results list
    updated_meta = []
    edges = []
    
    for i in range(n):
        curr_id = ids[i]
        sims = sim_matrix[i]
        
        # Sort indices by similarity descending
        sorted_indices = sims.argsort()[::-1]
        
        # Filter out self (which is at index 0 because similarity is 1.0)
        neighbors_indices = [idx for idx in sorted_indices if idx != i]
        top_k_indices = neighbors_indices[:k]
        
        nearest_ids = [str(ids[idx]) for idx in top_k_indices]
        
        # Semantic density: average similarity to K nearest neighbors
        k_sims = [float(sims[idx]) for idx in top_k_indices]
        sem_density = sum(k_sims) / len(k_sims) if k_sims else 1.0
        
        # Average overall similarity
        all_other_sims = [float(sims[idx]) for idx in neighbors_indices]
        avg_sim = sum(all_other_sims) / len(all_other_sims) if all_other_sims else 1.0
        
        updated_meta.append({
            "id": curr_id,
            "nearestNeighbors": nearest_ids,
            "semanticDensity": float(sem_density),
            "averageSimilarity": float(avg_sim)
        })
        
        # Generate semantic edges for top 2 neighbors to prevent graph clutter
        for idx in top_k_indices[:2]:
            neighbor_id = ids[idx]
            sim = float(sims[idx])
            dist = float(np.linalg.norm(vectors[i] - vectors[idx]))
            
            # Prevent double edges in undirected graph visualization
            if int(curr_id) < int(neighbor_id):
                edges.append({
                    "source": str(curr_id),
                    "target": str(neighbor_id),
                    "similarity": sim,
                    "distance": dist
                })
                
    # Calculate Cluster Cohesion and Separation if cluster labels exist
    # (These will be aggregated by the router layer using actual cluster categories)
    return {"edges": edges}, updated_meta

def explain_similarity(
    chunk_a: Dict[str, Any],
    chunk_b: Dict[str, Any],
    v1: List[float],
    v2: List[float]
) -> Dict[str, Any]:
    """
    Generates a detailed, education-oriented semantic comparison report 
    explaining WHY two text chunks are similar.
    """
    text_a = chunk_a.get("text", "")
    text_b = chunk_b.get("text", "")
    
    sim = compute_cosine_similarity(v1, v2)
    dist = compute_euclidean_distance(v1, v2)
    
    # Cosine similarity score as clean percentage
    sim_percent = max(0, min(100, int((sim + 1.0) / 2.0 * 100) if sim < 1.0 else 100))
    if sim > 0.999:
        sim_percent = 100
        
    # Find keyword intersections
    words_a = set(re.findall(r'\b[a-z]{3,}\b', text_a.lower()))
    words_b = set(re.findall(r'\b[a-z]{3,}\b', text_b.lower()))
    
    stop_words = {
        'the', 'and', 'for', 'this', 'that', 'with', 'from', 'each', 'will', 'have',
        'your', 'their', 'about', 'there', 'they', 'them', 'these', 'those'
    }
    
    clean_a = words_a - stop_words
    clean_b = words_b - stop_words
    overlap_words = sorted(list(clean_a.intersection(clean_b)))
    
    # Calculate Topic Overlap Ratio
    total_unique = len(clean_a.union(clean_b))
    topic_overlap_ratio = len(overlap_words) / total_unique if total_unique > 0 else 0.0
    
    # Check trigger rules for similar concepts
    reasons = []
    a_lower = text_a.lower()
    b_lower = text_b.lower()
    
    # Medical Match
    medical_keys = {"cardio", "angina", "pain", "ventric", "heart", "symptom", "blood", "medical", "patient"}
    if any(k in a_lower for k in medical_keys) and any(k in b_lower for k in medical_keys):
        reasons.append("Shared medical & cardiology concepts")
        
    # Deep Learning Match
    dl_keys = {"attention", "transformer", "encoder", "decoder", "layer", "neural", "train", "gpu"}
    if any(k in a_lower for k in dl_keys) and any(k in b_lower for k in dl_keys):
        reasons.append("Similar deep learning architectures")
        
    # Legal Match
    legal_keys = {"confidential", "discloser", "agreement", "party", "recipient", "proprietary", "written"}
    if any(k in a_lower for k in legal_keys) and any(k in b_lower for k in legal_keys):
        reasons.append("Related legal & confidentiality clauses")
        
    # RAG Match
    rag_keys = {"retrieval", "rag", "embedding", "vector", "database", "hallucination", "context", "prompt"}
    if any(k in a_lower for k in rag_keys) and any(k in b_lower for k in rag_keys):
        reasons.append("Similar RAG indexing pipeline components")
        
    # Coding Match
    code_keys = {"decorator", "closure", "wrapper", "function", "callable", "decorator_repeat"}
    if any(k in a_lower for k in code_keys) and any(k in b_lower for k in code_keys):
        reasons.append("Shared python closure & decorator logic")

    # General overlaps
    if len(overlap_words) > 3:
        reasons.append("High overlap of common descriptive terms")
    if sim_percent > 85:
        reasons.append("Close proximity in high-dimensional semantic space")
        
    if not reasons:
        reasons.append("Shared grammatical context structures")

    # Generate educational explanation
    if sim_percent >= 90:
        explanation = (
            "These chunks have exceptionally close semantic alignment. Their vectors point in almost the exact "
            "same direction in high-dimensional space, meaning they discuss the same core ideas using equivalent terms."
        )
    elif sim_percent >= 70:
        explanation = (
            "These chunks are moderately similar. They share general themes or top-level topics, but discuss different "
            "sub-points or use slightly distinct vocabularies."
        )
    else:
        explanation = (
            "These chunks are semantically distant. They lie in different areas of the embedding space, indicating "
            "disparate contexts or unrelated subject matters."
        )

    return {
        "similarity": sim_percent,
        "cosine_similarity": float(sim),
        "euclidean_distance": float(dist),
        "overlap_words": overlap_words[:8], # limit to top 8 to avoid UI bloat
        "topic_overlap_ratio": float(topic_overlap_ratio),
        "reasons": reasons,
        "explanation": explanation
    }
