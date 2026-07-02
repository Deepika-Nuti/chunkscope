import io
import time
import math
import pypdf
import docx
import numpy as np

from fastapi import FastAPI, UploadFile, File, HTTPException
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
from app.similarity import (
    calculate_semantic_metrics,
    explain_similarity,
    compute_cosine_similarity,
)

# ==========================================================
# CREATE FASTAPI APP FIRST
# ==========================================================

app = FastAPI(
    title="ChunkScope API",
    version="2.0"
)

# ==========================================================
# ROOT ROUTE
# ==========================================================

@app.get("/")
async def root():
    return {
        "message": "ChunkScope Backend Running",
        "service": "ChunkScope API",
        "version": "2.0"
    }

# ==========================================================
# HEALTH CHECK ROUTE
# ==========================================================

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "service": "ChunkScope API",
        "version": "2.0"
    }

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chunkscope.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# REQUEST SCHEMAS
# ==========================================================

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

# ==========================================================
# CONTINUE WITH YOUR EXISTING ENDPOINTS BELOW
# ==========================================================