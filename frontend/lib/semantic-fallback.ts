import { Chunk } from "./fallback-engine";

export interface SemanticEdge {
  source: string;
  target: string;
  similarity: number;
  distance: number;
}

export interface EmbeddedChunk {
  id: string;
  text: string;
  strategy: string;
  start: number;
  end: number;
  tokenCount: number;
  overlap: number;
  page?: number;
  paragraph?: number;
  sentence?: number;
  createdBy: string;
  creationReason: string[];
  coherenceScore: number;
  contextPreservation: number;
  retrievalEstimate: number;
  
  // Extended Phase 2 properties
  embedding: number[];
  projected2D: { x: number; y: number };
  cluster?: number;
  semanticTopic?: string;
  nearestNeighbors?: string[];
  averageSimilarity?: number;
  semanticDensity?: number;
  clusterConfidence?: number;
  embeddingModel?: string;
  semanticExplanation?: string[];
}

export interface SemanticReport {
  similarity: number;
  cosine_similarity: number;
  euclidean_distance: number;
  overlap_words: string[];
  topic_overlap_ratio: number;
  reasons: string[];
  explanation: string;
}

// 1. Deterministic Centroid vectors for 5 topics
function getCentroidVector(topic: string, index: number, dimensions = 384): number[] {
  const vector: number[] = [];
  // Use simple trigonometric hash to generate stable vectors
  for (let d = 0; d < dimensions; d++) {
    const angle = (d * (index + 1) * Math.PI) / 12;
    vector.push(Math.sin(angle) * Math.cos(angle * 1.5));
  }
  return vector;
}

// Classify chunk text against our 5 demo document topics
function getTopicWeights(text: string): Record<string, number> {
  const textLower = text.toLowerCase();
  
  const keywords = {
    attention: ["attention", "transformer", "encoder", "decoder", "layer", "bleu", "gpu", "recurrent"],
    agreement: ["agreement", "nda", "confidential", "proprietary", "recipient", "discloser", "obligations", "disclosure"],
    cardiology: ["cardiology", "chest", "pain", "angina", "ecg", "heart", "coronary", "troponin", "physician"],
    retrieval: ["retrieval", "rag", "indexing", "chunking", "database", "hallucinations", "embeddings", "query"],
    decorator: ["decorator", "closure", "wrapper", "function", "first-class", "callable", "args", "kwargs"]
  };

  const weights: Record<string, number> = {
    attention: 0,
    agreement: 0,
    cardiology: 0,
    retrieval: 0,
    decorator: 0
  };

  let total = 0;
  Object.entries(keywords).forEach(([topic, keys]) => {
    let count = 0;
    keys.forEach((key) => {
      const regex = new RegExp(key, "gi");
      count += (textLower.match(regex) || []).length;
    });
    weights[topic] = count;
    total += count;
  });

  // Normalize weights
  if (total > 0) {
    Object.keys(weights).forEach((k) => {
      weights[k] /= total;
    });
  } else {
    // Default fallback to uniform distribution
    Object.keys(weights).forEach((k) => {
      weights[k] = 0.2;
    });
  }

  return weights;
}

// 2. Generate deterministic embedding vectors
export function generateMockEmbedding(text: string, modelName = "all-MiniLM-L6-v2"): number[] {
  const dimensions = modelName.includes("mpnet") ? 768 : 384;
  const weights = getTopicWeights(text);
  
  // Mix centroid vectors according to classification weights
  const finalVector = new Array(dimensions).fill(0);
  
  const topicsList = ["attention", "agreement", "cardiology", "retrieval", "decorator"];
  topicsList.forEach((topic, idx) => {
    const weight = weights[topic];
    if (weight > 0) {
      const centroid = getCentroidVector(topic, idx, dimensions);
      for (let d = 0; d < dimensions; d++) {
        finalVector[d] += weight * centroid[d];
      }
    }
  });

  // Inject small deterministic perturbation/noise using characters hashes
  const seed = text.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  for (let d = 0; d < dimensions; d++) {
    const noise = Math.sin(d + seed) * 0.12;
    finalVector[d] += noise;
  }

  // Normalize vector to unit circle
  const norm = Math.sqrt(finalVector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let d = 0; d < dimensions; d++) {
      finalVector[d] /= norm;
    }
  }

  return finalVector;
}

// 3. Client-side Power Iteration PCA to project high-dimensional vectors to 2D
export function projectPCA(vectors: number[][]): { x: number; y: number }[] {
  if (vectors.length === 0) return [];
  const nSamples = vectors.length;
  const nDims = vectors[0].length;

  if (nSamples === 1) return [{ x: 0, y: 0 }];

  // 1. Subtract mean of each dimension (Centering)
  const means = new Array(nDims).fill(0);
  for (let i = 0; i < nSamples; i++) {
    for (let d = 0; d < nDims; d++) {
      means[d] += vectors[i][d];
    }
  }
  for (let d = 0; d < nDims; d++) means[d] /= nSamples;

  const centered = vectors.map((v) => v.map((val, d) => val - means[d]));

  // 2. Power iteration to find 1st Principal Component
  // We compute PCA directly by finding eigenvectors of Covariance matrix C (X^T * X)
  // Instead of full covariance matrix multiplication (size 384x384), we can run 
  // power iteration on the data samples directly: v <- X^T * (X * v)
  let p1 = new Array(nDims).fill(0).map(() => Math.random() - 0.5);
  // Normalize p1
  let norm1 = Math.sqrt(p1.reduce((sum, val) => sum + val * val, 0));
  p1 = p1.map((val) => val / (norm1 || 1));

  // Loop power iteration steps
  for (let iter = 0; iter < 12; iter++) {
    // X * v (project samples onto p1)
    const projections = centered.map((v) => v.reduce((sum, val, d) => sum + val * p1[d], 0));
    
    // v_new = X^T * projections
    const p1New = new Array(nDims).fill(0);
    for (let i = 0; i < nSamples; i++) {
      const proj = projections[i];
      for (let d = 0; d < nDims; d++) {
        p1New[d] += centered[i][d] * proj;
      }
    }
    
    // Normalize
    const norm = Math.sqrt(p1New.reduce((sum, val) => sum + val * val, 0));
    p1 = p1New.map((val) => val / (norm || 1));
  }

  // 3. Deflation to find 2nd Principal Component
  // Subtract projection on p1 from centered data: X_deflated = X - (X * p1) * p1
  const deflated = centered.map((v) => {
    const proj = v.reduce((sum, val, d) => sum + val * p1[d], 0);
    return v.map((val, d) => val - proj * p1[d]);
  });

  // Power iteration on deflated data
  let p2 = new Array(nDims).fill(0).map(() => Math.random() - 0.5);
  let norm2 = Math.sqrt(p2.reduce((sum, val) => sum + val * val, 0));
  p2 = p2.map((val) => val / (norm2 || 1));

  for (let iter = 0; iter < 10; iter++) {
    const projections = deflated.map((v) => v.reduce((sum, val, d) => sum + val * p2[d], 0));
    const p2New = new Array(nDims).fill(0);
    for (let i = 0; i < nSamples; i++) {
      const proj = projections[i];
      for (let d = 0; d < nDims; d++) {
        p2New[d] += deflated[i][d] * proj;
      }
    }
    const norm = Math.sqrt(p2New.reduce((sum, val) => sum + val * val, 0));
    p2 = p2New.map((val) => val / (norm || 1));
  }

  // 4. Project original centered data onto p1 and p2
  const projected = centered.map((v) => {
    const x = v.reduce((sum, val, d) => sum + val * p1[d], 0);
    const y = v.reduce((sum, val, d) => sum + val * p2[d], 0);
    return { x, y };
  });

  // Scale projected coordinates to range [-1, 1] for D3 bounding box
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX;
  const spanY = maxY - minY;

  return projected.map((p) => ({
    x: spanX > 1e-4 ? 2.0 * (p.x - minX) / spanX - 1.0 : 0.0,
    y: spanY > 1e-4 ? 2.0 * (p.y - minY) / spanY - 1.0 : 0.0,
  }));
}

// 4. Client-side KMeans clustering
export function clusterKMeans(coords: { x: number; y: number }[], k: number): number[] {
  const n = coords.length;
  if (n === 0) return [];
  const finalK = Math.min(k, n);

  // Initialize centroids by choosing first K distinct coords
  const centroids = coords.slice(0, finalK).map((c) => ({ ...c }));
  const labels = new Array(n).fill(0);

  // Run 10 iterations
  for (let iter = 0; iter < 10; iter++) {
    // Assign points to nearest centroid
    for (let i = 0; i < n; i++) {
      const p = coords[i];
      let minDist = Infinity;
      let minIdx = 0;
      
      for (let c = 0; c < finalK; c++) {
        const cent = centroids[c];
        const dist = Math.pow(p.x - cent.x, 2) + Math.pow(p.y - cent.y, 2);
        if (dist < minDist) {
          minDist = dist;
          minIdx = c;
        }
      }
      labels[i] = minIdx;
    }

    // Recompute centroids
    const counts = new Array(finalK).fill(0);
    centroids.forEach((c) => {
      c.x = 0;
      c.y = 0;
    });

    for (let i = 0; i < n; i++) {
      const lbl = labels[i];
      centroids[lbl].x += coords[i].x;
      centroids[lbl].y += coords[i].y;
      counts[lbl]++;
    }

    for (let c = 0; c < finalK; c++) {
      if (counts[c] > 0) {
        centroids[c].x /= counts[c];
        centroids[c].y /= counts[c];
      }
    }
  }

  return labels;
}

// Calculate TF-IDF style topic labels on client side
export function getClientTopicName(texts: string[]): string {
  if (texts.length === 0) return "Generic Topic";
  
  // Extract all words larger than 3 characters, lowercase, clean
  const frequency: Record<string, number> = {};
  const stopWords = new Set([
    'document', 'chunk', 'text', 'information', 'system', 'process', 'using',
    'the', 'and', 'for', 'this', 'that', 'with', 'from', 'each', 'will', 'have',
    'about', 'there', 'they', 'them', 'these', 'those', 'also', 'their', 'your'
  ]);

  texts.forEach((text) => {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    words.forEach((w) => {
      if (!stopWords.has(w)) {
        frequency[w] = (frequency[w] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
  const top2 = sorted.slice(0, 2).map((item) => item[0]);

  if (top2.length === 0) return "General Content";
  return top2.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" & ");
}

// 5. Cosine similarity & Euclidean distance helper
export function cosineSimilarity(v1: number[], v2: number[]): number {
  let dot = 0;
  let n1 = 0;
  let n2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    n1 += v1[i] * v1[i];
    n2 += v2[i] * v2[i];
  }
  const norm = Math.sqrt(n1) * Math.sqrt(n2);
  return norm > 0 ? dot / norm : 0;
}

export function euclideanDistance(v1: number[], v2: number[]): number {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
}

// 6. Generate detailed semantic comparison explanation
export function getSemanticExplanation(
  chunkA: EmbeddedChunk,
  chunkB: EmbeddedChunk,
  v1: number[],
  v2: number[]
): SemanticReport {
  const sim = cosineSimilarity(v1, v2);
  const dist = euclideanDistance(v1, v2);
  
  // Normalized percentage
  const simPercent = Math.max(0, Math.min(100, Math.round(((sim + 1) / 2) * 100)));
  
  const textA = chunkA.text.toLowerCase();
  const textB = chunkB.text.toLowerCase();
  
  const wordsA = new Set(textA.match(/\b[a-z]{3,}\b/g) || []);
  const wordsB = new Set(textB.match(/\b[a-z]{3,}\b/g) || []);
  
  const stopWords = new Set([
    'the', 'and', 'for', 'this', 'that', 'with', 'from', 'each', 'will', 'have',
    'your', 'their', 'about', 'there', 'they', 'them', 'these', 'those'
  ]);
  
  const cleanA = new Set([...wordsA].filter(x => !stopWords.has(x)));
  const cleanB = new Set([...wordsB].filter(x => !stopWords.has(x)));
  const overlap = [...cleanA].filter(x => cleanB.has(x));
  
  const totalUnique = new Set([...cleanA, ...cleanB]).size;
  const ratio = totalUnique > 0 ? overlap.length / totalUnique : 0;

  const reasons: string[] = [];
  
  // Topic matching
  if (textA.includes("cardi") && textB.includes("cardi")) reasons.push("Shared cardiology medical diagnostics");
  if (textA.includes("agreement") && textB.includes("agreement")) reasons.push("Related mutual NDA confidentiality covenants");
  if (textA.includes("attention") && textB.includes("attention")) reasons.push("Similar self-attention transformer formulas");
  if (textA.includes("retrieval") && textB.includes("retrieval")) reasons.push("Shared indexing search pipelines");
  if (textA.includes("decorator") && textB.includes("decorator")) reasons.push("Similar python function closure decorators");

  if (overlap.length > 2) reasons.push("Overlapping descriptive vocabulary terms");
  if (simPercent > 80) reasons.push("High vector proximity in high-dimensional semantic spaces");
  
  if (reasons.length === 0) reasons.push("Common vocabulary sentence patterns");

  let explanation = "";
  if (simPercent >= 90) {
    explanation = "These passages contain highly similar contexts. Their high-dimensional vectors point in almost the exact same direction, indicating near-identical conceptual mappings.";
  } else if (simPercent >= 65) {
    explanation = "These passages contain general thematic overlaps. They reference similar high-level ideas but differ in specific vocabularies or topics.";
  } else {
    explanation = "These passages are semantically unrelated. They lie in distant sections of the vector database index space.";
  }

  return {
    similarity: simPercent,
    cosine_similarity: sim,
    euclidean_distance: dist,
    overlap_words: overlap.slice(0, 6),
    topic_overlap_ratio: ratio,
    reasons,
    explanation
  };
}

// 7. Calculate all client side semantic metrics and HNSW/FAISS edges
export function simulateSemanticLayer(
  embeddedChunks: EmbeddedChunk[],
  k = 3
): {
  chunks: EmbeddedChunk[];
  edges: SemanticEdge[];
  metrics: {
    avgSimilarity: number;
    entropy: number;
    cohesion: number;
    separation: number;
  };
} {
  const n = embeddedChunks.length;
  if (n === 0) return { chunks: [], edges: [], metrics: { avgSimilarity: 0, entropy: 0, cohesion: 0, separation: 0 } };

  // Project PCA coordinates
  const vectors = embeddedChunks.map((c) => c.embedding);
  const coords2D = projectPCA(vectors);
  
  // Assign 2D coordinates
  for (let i = 0; i < n; i++) {
    embeddedChunks[i].projected2D = coords2D[i];
  }

  // Run KMeans Clustering (always use k=4 for fallback)
  const labels = clusterKMeans(coords2D, 4);
  
  // Group text by label
  const clusterTexts: Record<number, string[]> = {};
  for (let i = 0; i < n; i++) {
    const lbl = labels[i];
    embeddedChunks[i].cluster = lbl;
    if (!clusterTexts[lbl]) clusterTexts[lbl] = [];
    clusterTexts[lbl].push(embeddedChunks[i].text);
  }

  // Generate topic names
  const topicNames: Record<number, string> = {};
  Object.keys(clusterTexts).forEach((lblStr) => {
    const lbl = parseInt(lblStr);
    topicNames[lbl] = getClientTopicName(clusterTexts[lbl]);
  });

  for (let i = 0; i < n; i++) {
    const lbl = labels[i];
    embeddedChunks[i].semanticTopic = topicNames[lbl];
    embeddedChunks[i].clusterConfidence = 0.75 + Math.random() * 0.23; // mock confidence
  }

  // Calculate Nearest Neighbors & Edges
  const edges: SemanticEdge[] = [];
  let totalSimSum = 0;
  let totalPairs = 0;

  for (let i = 0; i < n; i++) {
    const sims: { idx: number; sim: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const sim = cosineSimilarity(vectors[i], vectors[j]);
        sims.push({ idx: j, sim });
        
        totalSimSum += sim;
        totalPairs++;
      }
    }

    // Sort neighbors descending
    sims.sort((a, b) => b.sim - a.sim);
    const topNeighbors = sims.slice(0, k);
    embeddedChunks[i].nearestNeighbors = topNeighbors.map((item) => embeddedChunks[item.idx].id);
    
    // Average similarity
    const avgSim = topNeighbors.reduce((sum, item) => sum + item.sim, 0) / topNeighbors.length;
    embeddedChunks[i].averageSimilarity = avgSim;
    embeddedChunks[i].semanticDensity = avgSim;

    // Add edges for top 2 neighbors
    topNeighbors.slice(0, 2).forEach((neighbor) => {
      const sourceId = embeddedChunks[i].id;
      const targetId = embeddedChunks[neighbor.idx].id;
      const dist = euclideanDistance(vectors[i], vectors[neighbor.idx]);

      if (parseInt(sourceId) < parseInt(targetId)) {
        edges.push({
          source: sourceId,
          target: targetId,
          similarity: neighbor.sim,
          distance: dist
        });
      }
    });
  }

  // Compute cluster cohesion & separation
  // Cohesion: average similarity between vectors inside same cluster
  let cohesionSum = 0;
  let cohesionPairs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (embeddedChunks[i].cluster === embeddedChunks[j].cluster) {
        cohesionSum += cosineSimilarity(vectors[i], vectors[j]);
        cohesionPairs++;
      }
    }
  }
  const cohesion = cohesionPairs > 0 ? cohesionSum / cohesionPairs : 0.85;

  // Separation: average distance between different cluster centroids
  const centroids: Record<number, number[]> = {};
  const centroidCounts: Record<number, number> = {};
  
  for (let i = 0; i < n; i++) {
    const lbl = labels[i];
    if (!centroids[lbl]) {
      centroids[lbl] = new Array(vectors[0].length).fill(0);
      centroidCounts[lbl] = 0;
    }
    for (let d = 0; d < vectors[0].length; d++) {
      centroids[lbl][d] += vectors[i][d];
    }
    centroidCounts[lbl]++;
  }

  const centroidList: number[][] = [];
  Object.keys(centroids).forEach((lblStr) => {
    const lbl = parseInt(lblStr);
    const count = centroidCounts[lbl];
    const cent = centroids[lbl].map((val) => val / count);
    centroidList.push(cent);
  });

  let sepSum = 0;
  let sepPairs = 0;
  for (let i = 0; i < centroidList.length; i++) {
    for (let j = i + 1; j < centroidList.length; j++) {
      sepSum += euclideanDistance(centroidList[i], centroidList[j]);
      sepPairs++;
    }
  }
  const separation = sepPairs > 0 ? sepSum / sepPairs : 1.25;

  // Entropy
  const clusterSizes: Record<number, number> = {};
  labels.forEach((l) => {
    clusterSizes[l] = (clusterSizes[l] || 0) + 1;
  });
  let entropy = 0;
  Object.values(clusterSizes).forEach((size) => {
    const p = size / n;
    entropy -= p * Math.log2(p);
  });

  return {
    chunks: embeddedChunks,
    edges,
    metrics: {
      avgSimilarity: totalPairs > 0 ? totalSimSum / totalPairs : 0.8,
      entropy: Math.round(entropy * 100) / 100,
      cohesion: Math.round(cohesion * 100) / 100,
      separation: Math.round(separation * 100) / 100
    }
  };
}
