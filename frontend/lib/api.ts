import { simulateChunking, ChunkingResult, ChunkParams } from "./fallback-engine";
import { 
  EmbeddedChunk, 
  SemanticEdge, 
  SemanticReport, 
  simulateSemanticLayer, 
  getSemanticExplanation,
  generateMockEmbedding
} from "./semantic-fallback";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface FileMetadata {
  filename: string;
  file_size: number;
  page_count: number;
  word_count: number;
  char_count: number;
  token_count: number;
  text: string;
}

/**
 * Checks if the backend API is online.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(1200) });
    if (res.ok) {
      const data = await res.json();
      return data.status === "online";
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Uploads a document file to the backend, or parses TXT/MD files client-side if offline.
 */
export async function uploadDocument(file: File): Promise<FileMetadata> {
  const isBackendOnline = await checkBackendHealth();

  if (isBackendOnline) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to upload and parse document on server.");
    }

    return await response.json();
  }

  // Backend Offline: Fallback to client-side parsing for TXT / Markdown
  if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.type === "text/plain" || file.type === "text/markdown") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || "";
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const charCount = text.length;
        const tokenCount = Math.round(charCount / 4.1);
        
        resolve({
          filename: file.name,
          file_size: file.size,
          page_count: Math.max(1, Math.ceil(wordCount / 500)),
          word_count: wordCount,
          char_count: charCount,
          token_count: tokenCount,
          text: text,
        });
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file client-side."));
      };
      reader.readAsText(file);
    });
  }

  throw new Error(
    "Local API backend is offline. PDFs and DOCX files require the Python server to run. " +
    "Please upload a .txt or .md file, or start the backend with 'python run.py'."
  );
}

/**
 * Performs chunking on text using backend API if online, or local TypeScript fallback if offline.
 */
export async function chunkText(
  text: string,
  strategy: string,
  params: ChunkParams
): Promise<ChunkingResult> {
  const isBackendOnline = await checkBackendHealth();

  if (isBackendOnline) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chunk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          strategy,
          params,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Server failed to process chunk request.");
      }

      return await response.json();
    } catch (e: any) {
      console.warn("Backend chunking failed, falling back to browser logic:", e);
      return simulateChunking(text, strategy, params);
    }
  }

  return simulateChunking(text, strategy, params);
}

// --- PHASE 2 EMBEDDING API CALLS ---

/**
 * Runs the complete high-dimensional embedding, coordinate projection, 
 * and clustering flow. Falls back client-side if server goes down.
 */
export async function generateSemanticWorkspace(
  rawChunks: any[],
  modelName: string,
  projectionMethod: string,
  clusteringMethod: string,
  kClusters: number
): Promise<{
  chunks: EmbeddedChunk[];
  edges: SemanticEdge[];
  metrics: {
    avgSimilarity: number;
    entropy: number;
    cohesion: number;
    separation: number;
  };
}> {
  const isBackendOnline = await checkBackendHealth();
  
  // Format raw chunks into the base shape
  const baseChunks = rawChunks.map((c) => ({
    id: String(c.id),
    text: c.text,
    strategy: c.strategy || "recursive",
    start: c.start_char,
    end: c.end_char,
    tokenCount: c.token_count,
    overlap: c.overlap_prev + c.overlap_next,
    createdBy: c.strategy || "recursive",
    creationReason: [
      c.char_count > 450 ? "Maximum size reached" : "Syntactic separator detected",
      c.overlap_prev > 0 ? "Overlap context preserved" : ""
    ].filter(Boolean),
    coherenceScore: c.char_count < 400 ? 95 : 65, // mock scores
    contextPreservation: c.overlap_prev > 0 ? 95 : 35,
    retrievalEstimate: c.overlap_prev > 0 ? 90 : 50,
  }));

  if (!isBackendOnline) {
    // Falls back immediately to local SVD PCA & KMeans Math
    const embedded = baseChunks.map((c) => ({
      ...c,
      embedding: generateMockEmbedding(c.text, modelName),
      projected2D: { x: 0, y: 0 }
    }));
    return simulateSemanticLayer(embedded, 3);
  }

  try {
    // 1. Generate Embeddings on server
    const embedRes = await fetch(`${BACKEND_URL}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chunks: baseChunks.map(c => ({ id: c.id, text: c.text })),
        model: modelName
      })
    });
    if (!embedRes.ok) throw new Error("Embed API failed");
    const { embeddings } = await embedRes.json();
    
    // Map vector values
    const embeddedMap: Record<string, number[]> = {};
    embeddings.forEach((item: any) => {
      embeddedMap[item.id] = item.vector;
    });

    const embeddedChunks: EmbeddedChunk[] = baseChunks.map((c) => ({
      ...c,
      embedding: embeddedMap[c.id] || [],
      projected2D: { x: 0, y: 0 },
      embeddingModel: modelName
    }));

    // 2. Project Coordinates to 2D on server
    const projectRes = await fetch(`${BACKEND_URL}/api/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeddings: embeddings.map((item: any) => ({ id: item.id, vector: item.vector })),
        method: projectionMethod
      })
    });
    if (!projectRes.ok) throw new Error("Project API failed");
    const { coordinates } = await projectRes.json();

    const coordsMap: Record<string, { x: number; y: number }> = {};
    coordinates.forEach((item: any) => {
      coordsMap[item.id] = { x: item.x, y: item.y };
    });

    embeddedChunks.forEach((c) => {
      c.projected2D = coordsMap[c.id] || { x: 0, y: 0 };
    });

    // 3. Cluster Points on server
    const clusterRes = await fetch(`${BACKEND_URL}/api/cluster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chunks: baseChunks.map(c => ({ id: c.id, text: c.text })),
        coordinates: coordinates.map((item: any) => ({ id: item.id, x: item.x, y: item.y })),
        method: clusteringMethod,
        k: kClusters
      })
    });
    if (!clusterRes.ok) throw new Error("Cluster API failed");
    const { clusters, metrics: clusterMetrics } = await clusterRes.json();

    const clustersMap: Record<string, { cluster: number; semanticTopic: string; clusterConfidence: number }> = {};
    clusters.forEach((item: any) => {
      clustersMap[item.id] = {
        cluster: item.cluster,
        semanticTopic: item.semanticTopic,
        clusterConfidence: item.clusterConfidence
      };
    });

    embeddedChunks.forEach((c) => {
      const info = clustersMap[c.id] || { cluster: 0, semanticTopic: "General Topic", clusterConfidence: 1.0 };
      c.cluster = info.cluster;
      c.semanticTopic = info.semanticTopic;
      c.clusterConfidence = info.clusterConfidence;
    });

    // 4. Calculate edges & similarities on server
    const metricsRes = await fetch(`${BACKEND_URL}/api/metrics?k=3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embeddings.map((item: any) => ({ id: item.id, vector: item.vector })))
    });
    if (!metricsRes.ok) throw new Error("Metrics API failed");
    const { edges, metrics, global_metrics } = await metricsRes.json();

    const neighborsMap: Record<string, { nearestNeighbors: string[]; semanticDensity: number; averageSimilarity: number }> = {};
    metrics.forEach((item: any) => {
      neighborsMap[item.id] = {
        nearestNeighbors: item.nearestNeighbors,
        semanticDensity: item.semanticDensity,
        averageSimilarity: item.averageSimilarity
      };
    });

    embeddedChunks.forEach((c) => {
      const info = neighborsMap[c.id] || { nearestNeighbors: [], semanticDensity: 0.8, averageSimilarity: 0.8 };
      c.nearestNeighbors = info.nearestNeighbors;
      c.semanticDensity = info.semanticDensity;
      c.averageSimilarity = info.averageSimilarity;
    });

    return {
      chunks: embeddedChunks,
      edges,
      metrics: {
        avgSimilarity: global_metrics.avg_pairwise_similarity || 0.8,
        entropy: clusterMetrics.semantic_entropy || 1.25,
        cohesion: global_metrics.cohesion_score || 0.85,
        separation: 1.2 // standard distance separation
      }
    };

  } catch (err) {
    console.warn("Backend semantic pipeline failed, running browser-side simulation fallback:", err);
    // Dynamic JS fallback SVD/KMeans Sizing
    const embedded = baseChunks.map((c) => ({
      ...c,
      embedding: generateMockEmbedding(c.text, modelName),
      projected2D: { x: 0, y: 0 }
    }));
    return simulateSemanticLayer(embedded, 3);
  }
}
