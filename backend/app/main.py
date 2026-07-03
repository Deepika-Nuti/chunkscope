import io
import time
import math
import numpy as np
import pypdf
import docx

from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
)

print("===================================")
print("CHUNKSCOPE MAIN.PY LOADED")
print("===================================")

# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="ChunkScope API",
    version="2.0"
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "https://chunkscope.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# DEBUG
# =====================================================

@app.get("/")
def root():
    return {
        "message": "ChunkScope API Running"
    }

@app.get("/debug")
def debug():
    return {
        "message": "NEW MAIN.PY IS RUNNING"
    }

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "ChunkScope API",
        "version": "2.0"
    }

# =====================================================
# REQUEST MODELS
# =====================================================

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


# =====================================================
# FILE UPLOAD
# =====================================================

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):

    try:
        file_bytes = await file.read()

        filename = file.filename
        content_type = file.content_type

        text = ""
        page_count = 1

        # PDF
        if filename.endswith(".pdf") or content_type == "application/pdf":

            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)

            pages = []

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    pages.append(page_text)

            text = "\n".join(pages)

        # DOCX
        elif (
            filename.endswith(".docx")
            or content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):

            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join(
                [p.text for p in doc.paragraphs]
            )

            page_count = max(
                1,
                len(text.split()) // 500
            )

        # TXT / MD
        elif (
            filename.endswith(".txt")
            or filename.endswith(".md")
            or content_type in [
                "text/plain",
                "text/markdown",
            ]
        ):

            text = file_bytes.decode(
                "utf-8",
                errors="ignore"
            )

        else:
            raise HTTPException(
                400,
                "Unsupported file type"
            )

        if not text.strip():
            raise HTTPException(
                400,
                "No text extracted"
            )

        return {
            "filename": filename,
            "file_size": len(file_bytes),
            "page_count": page_count,
            "word_count": len(text.split()),
            "char_count": len(text),
            "token_count": get_token_count(text),
            "text": text,
        }

    except Exception as e:
        raise HTTPException(
            500,
            str(e)
        )

# =====================================================
# CHUNKING
# =====================================================

@app.post("/api/chunk")
def chunk_text(request: ChunkRequest):

    text = request.text
    params = request.params

    strategy = request.strategy.lower()

    if strategy == "fixed":
        chunks = fixed_size_chunking(
            text,
            params.chunk_size,
            params.chunk_overlap,
        )

    elif strategy == "recursive":
        chunks = recursive_character_chunking(
            text,
            params.chunk_size,
            params.chunk_overlap,
            params.separators,
        )

    elif strategy == "sentence":
        chunks = sentence_chunking(
            text,
            params.sentences_per_chunk,
        )

    elif strategy == "paragraph":
        chunks = paragraph_chunking(
            text,
            params.paragraphs_per_chunk,
        )

    elif strategy == "sliding":
        chunks = sliding_window_chunking(
            text,
            params.window_size,
            params.stride,
        )

    else:
        raise HTTPException(
            400,
            "Unknown strategy"
        )

    return {
        "chunks": chunks
    }

# =====================================================
# EMBEDDINGS
# =====================================================

@app.post("/api/embed")
def embed(request: EmbedRequest):

    texts = [
        c.text
        for c in request.chunks
    ]

    vectors = embed_texts(
        texts,
        request.model,
    )

    return {
        "embeddings": [
            {
                "id": request.chunks[i].id,
                "vector": vectors[i]
            }
            for i in range(
                len(request.chunks)
            )
        ]
    }

# =====================================================
# PROJECT
# =====================================================

@app.post("/api/project")
def project(request: ProjectRequest):

    return {
        "coordinates":
            project_embeddings(
                [
                    {
                        "id": x.id,
                        "vector": x.vector
                    }
                    for x in request.embeddings
                ],
                request.method,
            )
    }

# =====================================================
# CLUSTER
# =====================================================

@app.post("/api/cluster")
def cluster(request: ClusterRequest):

    return {
        "clusters":
            cluster_coordinates(
                [
                    {
                        "id": x.id,
                        "text": x.text
                    }
                    for x in request.chunks
                ],
                [
                    {
                        "id": x.id,
                        "x": x.x,
                        "y": x.y
                    }
                    for x in request.coordinates
                ],
                request.method,
                request.k,
            )
    }

# =====================================================
# SIMILARITY
# =====================================================

@app.post("/api/similarity")
def similarity(request: SimilarityRequest):

    return explain_similarity(
        request.chunk_a,
        request.chunk_b,
        request.vector_a,
        request.vector_b,
    )

# =====================================================
# METRICS
# =====================================================

@app.post("/api/metrics")
def metrics(
    request: List[VectorInput],
    k: int = 3,
):

    data = [
        {
            "id": x.id,
            "vector": x.vector,
        }
        for x in request
    ]

    edges, meta = calculate_semantic_metrics(
        data,
        k,
    )

    return {
        "edges": edges["edges"],
        "metrics": meta,
        "global_metrics": {}
    }