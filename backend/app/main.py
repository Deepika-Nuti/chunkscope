import io
import time
import math
import pypdf
import docx
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.chunkers import (
    fixed_size_chunking,
    recursive_character_chunking,
    sentence_chunking,
    paragraph_chunking,
    sliding_window_chunking,
    get_token_count
)

from app.embeddings import embed_texts
from app.projection import project_embeddings
from app.clustering import cluster_coordinates
from app.similarity import calculate_semantic_metrics, explain_similarity, compute_cosine_similarity

app = FastAPI(title="ChunkScope API", version="2.0")

# Setup CORS so Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REQUEST SCHEMAS ---

class ChunkParams(BaseModel):
    chunk_size: Optional[int] = 500
    chunk_overlap: Optional[int] = 100
    separators: Optional[List[str]] = None
    sentences_per_chunk: Optional[int] = 3
    paragraphs_per_chunk: Optional[int] = 1
    window_size: Optional[int] = 100
    stride: Optional[int] = 50

class ChunkRequest(BaseModel):
    text: str
    strategy: str
    params: ChunkParams

class ChunkInput(BaseModel):
    id: str
    text: str

class EmbedRequest(BaseModel):
    chunks: List[ChunkInput]
    model: str = "all-MiniLM-L6-v2"

class VectorInput(BaseModel):
    id: str
    vector: List[float]

class ProjectRequest(BaseModel):
    embeddings: List[VectorInput]
    method: str = "pca"

class CoordinateInput(BaseModel):
    id: str
    x: float
    y: float

class ClusterRequest(BaseModel):
    chunks: List[ChunkInput]
    coordinates: List[CoordinateInput]
    method: str = "kmeans"
    k: int = 3

class SimilarityRequest(BaseModel):
    chunk_a: Dict[str, Any]
    chunk_b: Dict[str, Any]
    vector_a: List[float]
    vector_b: List[float]

# --- ENDPOINTS ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "ChunkScope API is running"}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    content_type = file.content_type
    
    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
        
        text = ""
        page_count = 1
        
        if filename.endswith(".pdf") or content_type == "application/pdf":
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                page_count = len(reader.pages)
                extracted_pages = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_pages.append(page_text)
                text = "\n".join(extracted_pages)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
                
        elif filename.endswith(".docx") or content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            try:
                doc = docx.Document(io.BytesIO(file_bytes))
                text = "\n".join([para.text for para in doc.paragraphs])
                page_count = max(1, len(text.split()) // 500)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse Word DOCX: {str(e)}")
                
        elif filename.endswith(".txt") or filename.endswith(".md") or content_type in ["text/plain", "text/markdown"]:
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
                page_count = max(1, len(text.split()) // 500)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to decode text file: {str(e)}")
        else:
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
                page_count = max(1, len(text.split()) // 500)
            except Exception:
                raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, TXT, or MD.")

        if not text.strip():
            raise HTTPException(status_code=400, detail="Document appears to be empty or contains no extractable text.")
            
        word_count = len(text.split())
        char_count = len(text)
        token_count = get_token_count(text)
        
        return {
            "filename": filename,
            "file_size": file_size,
            "page_count": page_count,
            "word_count": word_count,
            "char_count": char_count,
            "token_count": token_count,
            "text": text
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during file upload: {str(e)}")

@app.post("/api/chunk")
def chunk_text(request: ChunkRequest):
    start_time = time.time()
    strategy = request.strategy.lower()
    text = request.text
    params = request.params
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
    try:
        chunks = []
        if strategy == "fixed":
            chunks = fixed_size_chunking(text, params.chunk_size, params.chunk_overlap)
        elif strategy == "recursive":
            chunks = recursive_character_chunking(text, params.chunk_size, params.chunk_overlap, params.separators)
        elif strategy == "sentence":
            chunks = sentence_chunking(text, params.sentences_per_chunk)
        elif strategy == "paragraph":
            chunks = paragraph_chunking(text, params.paragraphs_per_chunk)
        elif strategy == "sliding":
            chunks = sliding_window_chunking(text, params.window_size, params.stride)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown strategy: {strategy}")
            
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        total_chunks = len(chunks)
        if total_chunks > 0:
            avg_chunk_size = sum(c["char_count"] for c in chunks) / total_chunks
            avg_token_count = sum(c["token_count"] for c in chunks) / total_chunks
            largest_chunk = max(c["char_count"] for c in chunks)
            smallest_chunk = min(c["char_count"] for c in chunks)
        else:
            avg_chunk_size = 0
            avg_token_count = 0
            largest_chunk = 0
            smallest_chunk = 0
            
        return {
            "chunks": chunks,
            "statistics": {
                "total_chunks": total_chunks,
                "avg_chunk_size": round(avg_chunk_size, 1),
                "avg_token_count": round(avg_token_count, 1),
                "largest_chunk": largest_chunk,
                "smallest_chunk": smallest_chunk,
                "processing_time_ms": processing_time_ms
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chunking: {str(e)}")

# --- PHASE 2 EMBEDDINGS ENDPOINTS ---

@app.post("/api/embed")
def embed_chunks(request: EmbedRequest):
    if not request.chunks:
        return {"embeddings": []}
        
    try:
        texts = [chunk.text for chunk in request.chunks]
        vectors = embed_texts(texts, request.model)
        
        embeddings = [
            {"id": request.chunks[i].id, "vector": vectors[i]}
            for i in range(len(request.chunks))
        ]
        
        return {"embeddings": embeddings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@app.post("/api/project")
def project_coordinates(request: ProjectRequest):
    if not request.embeddings:
        return {"coordinates": []}
        
    try:
        # Convert Pydantic model to dict list
        input_data = [
            {"id": item.id, "vector": item.vector}
            for item in request.embeddings
        ]
        coords = project_embeddings(input_data, request.method)
        return {"coordinates": coords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dimensionality reduction projection failed: {str(e)}")

@app.post("/api/cluster")
def cluster_points(request: ClusterRequest):
    if not request.coordinates or not request.chunks:
        return {"clusters": [], "metrics": {}}
        
    try:
        chunks_input = [{"id": item.id, "text": item.text} for item in request.chunks]
        coords_input = [{"id": item.id, "x": item.x, "y": item.y} for item in request.coordinates]
        
        clusters = cluster_coordinates(chunks_input, coords_input, request.method, request.k)
        
        # Calculate cluster metrics (entropy)
        total = len(clusters)
        label_counts = {}
        for c in clusters:
            lbl = c["cluster"]
            label_counts[lbl] = label_counts.get(lbl, 0) + 1
            
        entropy = 0.0
        if total > 0:
            for count in label_counts.values():
                p = count / total
                entropy -= p * math.log2(p)
                
        metrics = {
            "cluster_count": len(label_counts),
            "semantic_entropy": round(entropy, 2)
        }
        
        return {"clusters": clusters, "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering algorithm execution failed: {str(e)}")

@app.post("/api/similarity")
def similarity_diagnose(request: SimilarityRequest):
    try:
        report = explain_similarity(
            request.chunk_a,
            request.chunk_b,
            request.vector_a,
            request.vector_b
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic similarity diagnosis failed: {str(e)}")

@app.post("/api/metrics")
def process_semantic_metrics(request: List[VectorInput], k: int = 3):
    if not request:
        return {"edges": [], "metrics": [], "global_metrics": {}}
        
    try:
        input_data = [{"id": item.id, "vector": item.vector} for item in request]
        edge_data, meta_data = calculate_semantic_metrics(input_data, k)
        
        # Calculate global cluster cohesion / separation estimates
        # Centroid calculation
        vectors = np.array([item.vector for item in request])
        n_samples = len(vectors)
        
        global_metrics = {}
        if n_samples > 1:
            mean_centroid = np.mean(vectors, axis=0)
            # Normalise centroid
            norm = np.linalg.norm(mean_centroid)
            if norm > 0:
                mean_centroid /= norm
            
            # Cohesion: Average similarity to centroid
            cohesion = float(np.mean(np.dot(vectors, mean_centroid)))
            # Separation: Average pairwise distance
            # Cosine similarity matrix
            sim_matrix = np.dot(vectors, vectors.T)
            pairwise_sims = []
            for i in range(n_samples):
                for j in range(i + 1, n_samples):
                    pairwise_sims.append(sim_matrix[i, j])
            
            avg_pairwise_sim = np.mean(pairwise_sims) if pairwise_sims else 1.0
            
            global_metrics = {
                "cohesion_score": float(cohesion),
                "avg_pairwise_similarity": float(avg_pairwise_sim)
            }
            
        return {
            "edges": edge_data["edges"],
            "metrics": meta_data,
            "global_metrics": global_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate semantic metrics: {str(e)}")
