import numpy as np
import re
from typing import List, Dict, Any

# Soft import for HDBSCAN
try:
    import hdbscan
except ImportError:
    hdbscan = None

def get_cluster_topic_name(texts: List[str]) -> str:
    """
    Extracts top keywords from a list of texts inside a cluster to generate a name.
    """
    if not texts:
        return "Unclassified"
        
    # Clean text to remove punctuation & lowercase
    cleaned = []
    for t in texts:
        clean = re.sub(r'[^a-zA-Z\s]', '', t.lower())
        clean_words = [w for w in clean.split() if len(w) > 2]
        if clean_words:
            cleaned.append(" ".join(clean_words))
            
    if not cleaned:
        return "Generic Content"
        
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        # Filter common RAG keywords that might pollute labels
        custom_stop_words = {
            'document', 'chunk', 'text', 'information', 'system', 'process', 'using',
            'the', 'and', 'for', 'this', 'that', 'with', 'from', 'each', 'will', 'have'
        }
        
        # Merge standard english stop words
        from sklearn.feature_extraction import text
        stop_words = list(text.ENGLISH_STOP_WORDS.union(custom_stop_words))
        
        vectorizer = TfidfVectorizer(stop_words=stop_words, max_features=10)
        tfidf = vectorizer.fit_transform(cleaned)
        
        scores = np.asarray(tfidf.sum(axis=0)).flatten()
        words = vectorizer.get_feature_names_out()
        
        if len(words) == 0:
            return "Topic Cluster"
            
        top_indices = scores.argsort()[::-1][:2]
        top_words = [words[i] for i in top_indices]
        
        return " & ".join(top_words).title()
        
    except Exception as e:
        print(f"TF-IDF topic generation failed: {str(e)}")
        # Quick fallback based on simple word count
        all_words = []
        for t in cleaned:
            all_words.extend(t.split())
        
        # Simple frequency count
        freq = {}
        for w in all_words:
            if len(w) > 3:
                freq[w] = freq.get(w, 0) + 1
        sorted_w = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        top_w = [item[0] for item in sorted_w[:2]]
        return " & ".join(top_w).title() if top_w else "General Topic"

def cluster_coordinates(
    chunks: List[Dict[str, Any]],
    coordinates: List[Dict[str, Any]],
    method: str,
    k_clusters: int = 3
) -> List[Dict[str, Any]]:
    """
    Clusters 2D coordinates and generates semantic topic summaries.
    """
    if not coordinates or not chunks:
        return []
        
    n_samples = len(coordinates)
    
    # Map ids to chunks
    chunk_map = {str(c["id"]): c["text"] for c in chunks}
    
    ids = [item["id"] for item in coordinates]
    X = np.array([[item["x"], item["y"]] for item in coordinates])
    
    method_lower = method.lower()
    labels = np.zeros(n_samples, dtype=int)
    confidences = np.ones(n_samples)
    
    try:
        if method_lower == "kmeans":
            from sklearn.cluster import KMeans
            # k cannot exceed sample count
            n_cl = min(k_clusters, n_samples)
            clusterer = KMeans(n_clusters=n_cl, random_state=42, n_init='auto')
            labels = clusterer.fit_predict(X)
            
            # Simple distance-based confidence
            distances = clusterer.transform(X)
            # Confidence is inversely proportional to distance from assigned centroid
            for i in range(n_samples):
                c_idx = labels[i]
                d = distances[i, c_idx]
                confidences[i] = float(np.exp(-d * 0.8))
                
        elif method_lower == "dbscan":
            from sklearn.cluster import DBSCAN
            # Dynamic eps based on sample size spacing
            eps = 0.35 if n_samples < 20 else 0.25
            clusterer = DBSCAN(eps=eps, min_samples=2)
            labels = clusterer.fit_predict(X)
            # Noise points are marked as -1
            
        elif method_lower == "hdbscan":
            if hdbscan is not None:
                min_cluster_size = min(3, max(2, n_samples // 6))
                clusterer = hdbscan.HDBSCAN(min_cluster_size=min_cluster_size)
                labels = clusterer.fit_predict(X)
                confidences = clusterer.probabilities_
            else:
                # Fallback to standard DBSCAN
                print("hdbscan is not installed. Falling back to DBSCAN.")
                from sklearn.cluster import DBSCAN
                eps = 0.35 if n_samples < 20 else 0.25
                clusterer = DBSCAN(eps=eps, min_samples=2)
                labels = clusterer.fit_predict(X)
                
        else:
            # Default fallback to single cluster
            labels = np.zeros(n_samples, dtype=int)
            
        # Group chunk texts by cluster label to compute topic names
        cluster_texts = {}
        for i in range(n_samples):
            lbl = int(labels[i])
            c_id = str(ids[i])
            txt = chunk_map.get(c_id, "")
            if lbl not in cluster_texts:
                cluster_texts[lbl] = []
            if txt:
                cluster_texts[lbl].append(txt)
                
        # Generate names
        topic_names = {}
        for lbl, texts in cluster_texts.items():
            if lbl == -1:
                topic_names[lbl] = "Outliers / Noise"
            else:
                topic_names[lbl] = get_cluster_topic_name(texts)
                
        # Format output list
        result = []
        for i in range(n_samples):
            lbl = int(labels[i])
            result.append({
                "id": ids[i],
                "cluster": lbl,
                "semanticTopic": topic_names.get(lbl, "Topic Cluster"),
                "clusterConfidence": float(confidences[i])
            })
            
        return result
        
    except Exception as e:
        print(f"Error executing clustering ({method}): {str(e)}")
        # Return all in cluster 0 as fallback
        return [
            {
                "id": ids[i],
                "cluster": 0,
                "semanticTopic": "General Topic",
                "clusterConfidence": 1.0
            }
            for i in range(n_samples)
        ]
