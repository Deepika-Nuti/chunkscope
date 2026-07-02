import numpy as np
from typing import List, Dict, Any

# Soft imports for UMAP
try:
    import umap
except ImportError:
    umap = None

def project_embeddings(embeddings: List[Dict[str, Any]], method: str) -> List[Dict[str, Any]]:
    """
    Projects high-dimensional vectors to 2D coordinates.
    """
    if not embeddings:
        return []
        
    ids = [item["id"] for item in embeddings]
    X = np.array([item["vector"] for item in embeddings])
    n_samples, n_features = X.shape
    
    if n_samples == 0:
        return []
        
    # If there is only 1 sample, we cannot project meaningfully. Just return origin.
    if n_samples == 1:
        return [{"id": ids[0], "x": 0.0, "y": 0.0}]
        
    method_lower = method.lower()
    
    try:
        if method_lower == "pca":
            from sklearn.decomposition import PCA
            # Cap components at min of samples or features
            n_comp = min(2, n_samples, n_features)
            projector = PCA(n_components=n_comp, random_state=42)
            coords = projector.fit_transform(X)
            if coords.shape[1] < 2:
                # Pad with zero if 1D output
                coords = np.hstack([coords, np.zeros((n_samples, 1))])
                
        elif method_lower == "tsne":
            from sklearn.manifold import TSNE
            # t-SNE perplexity must be less than n_samples
            perplexity = min(30.0, max(1.0, float(n_samples - 1) / 3.0))
            projector = TSNE(n_components=2, perplexity=perplexity, random_state=42, init='pca')
            coords = projector.fit_transform(X)
            
        elif method_lower == "umap":
            if umap is not None:
                # Configure UMAP params dynamically
                n_neighbors = min(15, max(2, n_samples - 1))
                projector = umap.UMAP(n_components=2, n_neighbors=n_neighbors, random_state=42)
                coords = projector.fit_transform(X)
            else:
                print("umap-learn is not installed. Falling back to t-SNE for projection.")
                from sklearn.manifold import TSNE
                perplexity = min(30.0, max(1.0, float(n_samples - 1) / 3.0))
                projector = TSNE(n_components=2, perplexity=perplexity, random_state=42, init='pca')
                coords = projector.fit_transform(X)
                
        else:
            # Default fallback to PCA
            from sklearn.decomposition import PCA
            n_comp = min(2, n_samples, n_features)
            projector = PCA(n_components=n_comp, random_state=42)
            coords = projector.fit_transform(X)
            if coords.shape[1] < 2:
                coords = np.hstack([coords, np.zeros((n_samples, 1))])
                
        # Scale coordinates to [-1, 1] range for visual consistency in D3
        x_min, x_max = coords[:, 0].min(), coords[:, 0].max()
        y_min, y_max = coords[:, 1].min(), coords[:, 1].max()
        
        scaled_coords = np.zeros_like(coords)
        if x_max - x_min > 1e-5:
            scaled_coords[:, 0] = 2.0 * (coords[:, 0] - x_min) / (x_max - x_min) - 1.0
        if y_max - y_min > 1e-5:
            scaled_coords[:, 1] = 2.0 * (coords[:, 1] - y_min) / (y_max - y_min) - 1.0
            
        return [
            {"id": ids[i], "x": float(scaled_coords[i, 0]), "y": float(scaled_coords[i, 1])}
            for i in range(n_samples)
        ]
        
    except Exception as e:
        print(f"Error during dimensionality reduction projection ({method}): {str(e)}")
        # Simple fallback projection using raw first 2 dimensions
        fallback = X[:, :2]
        if fallback.shape[1] < 2:
            fallback = np.hstack([fallback, np.zeros((n_samples, 1))])
        return [
            {"id": ids[i], "x": float(fallback[i, 0]), "y": float(fallback[i, 1])}
            for i in range(n_samples)
        ]
