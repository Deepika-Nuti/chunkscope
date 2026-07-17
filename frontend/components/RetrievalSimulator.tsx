"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Cpu, Network, FileText, Check, ChevronRight, Sparkles, HelpCircle, Info } from "lucide-react";
import { EmbeddedChunk, cosineSimilarity, euclideanDistance } from "../lib/semantic-fallback";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";
import { checkBackendHealth } from "../lib/api";

interface RetrievalSimulatorProps {
  chunks: EmbeddedChunk[];
  embeddingModel: string;
  isLearningMode: boolean;
  onHighlightChunk: (id: number | null) => void;
}

type SimStage = "idle" | "query" | "vector" | "similarity" | "results" | "prompt";

export default function RetrievalSimulator({
  chunks,
  embeddingModel,
  isLearningMode,
  onHighlightChunk,
}: RetrievalSimulatorProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeStage, setActiveStage] = useState<SimStage>("idle");
  const [retrievedResults, setRetrievedResults] = useState<{ chunk: EmbeddedChunk; score: number; rank: number; dist: number }[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [queryVector, setQueryVector] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset when chunks changes
  useEffect(() => {
    setRetrievedResults([]);
    setSelectedResultId(null);
    setActiveStage("idle");
    setQueryVector([]);
  }, [chunks.length]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || chunks.length === 0) return;

    setIsSearching(true);
    setError(null);
    setSelectedResultId(null);
    setRetrievedResults([]);
    
    // Step 1: User Query starts
    setActiveStage("query");

    try {
      // Fetch or generate query vector
      let vector: number[] = [];
      const isOnline = await checkBackendHealth();

      await new Promise((resolve) => setTimeout(resolve, 500)); // stagger effect
      
      // Step 2: Vectorization
      setActiveStage("vector");

      if (isOnline) {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${BACKEND_URL}/api/embed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunks: [{ id: "query", text: query }],
            model: embeddingModel
          })
        });
        if (!response.ok) throw new Error("Backend embedding service failed.");
        const data = await response.json();
        vector = data.embeddings[0].vector;
      } else {
        // Fallback mock embedder
        const { generateMockEmbedding } = await import("../lib/semantic-fallback");
        vector = generateMockEmbedding(query, embeddingModel);
      }

      setQueryVector(vector);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: Cosine Similarity Matching
      setActiveStage("similarity");

      const scored = chunks.map((c) => {
        const sim = cosineSimilarity(vector, c.embedding);
        const dist = euclideanDistance(vector, c.embedding);
        // Scale to 0-100%
        const score = Math.max(0, Math.min(100, Math.round(((sim + 1.0) / 2.0) * 100)));
        return { chunk: c, score, dist };
      });

      // Sort by similarity descending
      const sorted = scored.sort((a, b) => b.score - a.score);
      const top5 = sorted.slice(0, 5).map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 4: Results
      setRetrievedResults(top5);
      setActiveStage("results");
      
      if (top5.length > 0) {
        setSelectedResultId(top5[0].chunk.id);
        onHighlightChunk(parseInt(top5[0].chunk.id));
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 5: Prompt Context
      setActiveStage("prompt");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to project query vector.");
      setActiveStage("idle");
    } finally {
      setIsSearching(false);
    }
  };

  const selectedResult = useMemo(() => {
    if (!selectedResultId) return null;
    return retrievedResults.find((r) => r.chunk.id === selectedResultId) || null;
  }, [retrievedResults, selectedResultId]);

  // Compute matching words between query and selected chunk text
  const matchingKeywords = useMemo(() => {
    if (!selectedResult || !query) return [];
    const queryWords = new Set(query.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const chunkWords = new Set(selectedResult.chunk.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const stopWords = new Set(["the", "and", "for", "with", "from", "this", "that", "each", "will", "have", "about"]);
    return [...queryWords].filter((w) => chunkWords.has(w) && !stopWords.has(w));
  }, [selectedResult, query]);

  // Assembled prompt context string
  const assembledPromptContext = useMemo(() => {
    return retrievedResults.map((r) => `[Chunk #${r.chunk.id} - Relevance: ${r.score}%]\n${r.chunk.text}`).join("\n\n---\n\n");
  }, [retrievedResults]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px] select-none">
      
      {/* COLUMN 1: PIPELINE PATHWAYS & USER QUERY */}
      <div className="lg:col-span-2 flex flex-col h-full glass-panel border border-border bg-card/45 rounded-xl overflow-hidden p-4 space-y-4">
        
        {/* Title */}
        <div className="flex justify-between items-center pb-2 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span>Interactive RAG Retrieval Simulator</span>
          </span>
          <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/35 text-primary px-2 py-0.5 rounded font-mono uppercase font-bold">
            Real Embeddings Vector Search
          </span>
        </div>

        {/* Query Input form */}
        <form onSubmit={handleSearch} className="flex space-x-2 shrink-0">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ask a RAG search query (e.g. 'covenants of discloser' or 'self-attention layers')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              className="w-full pl-9 pr-3 py-2 text-xs bg-secondary rounded-xl border border-border outline-none focus:border-primary/50 text-foreground transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim() || chunks.length === 0}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all"
          >
            {isSearching ? <Cpu className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>{isSearching ? "Searching..." : "Retrieve"}</span>
          </button>
        </form>

        {error && (
          <div className="text-[10px] text-rose-400 border border-rose-500/25 bg-rose-500/5 p-2 rounded-lg shrink-0">
            {error}
          </div>
        )}

        {/* PIPELINE flowchart lighting steps */}
        <div className="grid grid-cols-5 gap-1.5 bg-secondary/15 p-2.5 border border-border/80 rounded-xl text-[9px] font-sans font-bold text-muted-foreground text-center shrink-0">
          {[
            { id: "query", label: "1. User Query", color: "text-blue-400 border-blue-500/40 bg-blue-500/5" },
            { id: "vector", label: "2. Vectorize", color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/5" },
            { id: "similarity", label: "3. Vector Search", color: "text-purple-400 border-purple-500/40 bg-purple-500/5" },
            { id: "results", label: "4. Retrieved Chunks", color: "text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/5" },
            { id: "prompt", label: "5. Prompt Assembled", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" },
          ].map((stg) => {
            const isActive = activeStage === stg.id;
            const isFinished = 
              (stg.id === "query" && activeStage !== "idle") ||
              (stg.id === "vector" && activeStage !== "idle" && activeStage !== "query") ||
              (stg.id === "similarity" && activeStage !== "idle" && activeStage !== "query" && activeStage !== "vector") ||
              (stg.id === "results" && (activeStage === "results" || activeStage === "prompt")) ||
              (stg.id === "prompt" && activeStage === "prompt");

            return (
              <div
                key={stg.id}
                className={`py-1.5 px-1 border rounded-lg transition-all ${
                  isActive 
                    ? `${stg.color} ring-1 ring-primary scale-102 font-extrabold` 
                    : isFinished 
                    ? "text-zinc-400 border-zinc-700 bg-zinc-800/10 font-semibold" 
                    : "opacity-25 border-transparent bg-transparent"
                }`}
              >
                {stg.label}
              </div>
            );
          })}
        </div>

        {/* RESULTS CONTENT VIEW */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {activeStage === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
              <Search className="h-8 w-8 mb-2 opacity-30 text-primary animate-pulse" />
              <span>Input a question above to visualize actual database retrieval logic.</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeStage === "query" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-2 text-xs">
                  <div className="font-extrabold text-blue-400 uppercase text-[9px] tracking-wider font-sans"> RAG Prompt query Ingested</div>
                  <p className="text-zinc-300 italic font-medium">"{query}"</p>
                </motion.div>
              )}

              {(activeStage === "vector" || (activeStage !== "query" && queryVector.length > 0)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-2 text-xs">
                  <div className="font-extrabold text-indigo-400 uppercase text-[9px] tracking-wider font-sans"> High-Dimensional Vectorization</div>
                  <div className="font-mono text-[9px] text-zinc-400 leading-normal break-all max-h-16 overflow-y-auto bg-black/30 p-2 border border-border rounded-lg scrollbar-thin">
                    [{queryVector.slice(0, 15).map(v => v.toFixed(5)).join(", ")} ... (+{queryVector.length - 15} dimensions)]
                  </div>
                </motion.div>
              )}

              {(activeStage === "similarity" || activeStage === "results" || activeStage === "prompt") && retrievedResults.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-400 block font-sans">
                    Retrieved Index Items (Top 5 Chunks)
                  </span>

                  <div className="space-y-2.5">
                    {retrievedResults.map((res) => {
                      const isSelected = selectedResultId === res.chunk.id;

                      return (
                        <div
                          key={res.chunk.id}
                          onClick={() => {
                            setSelectedResultId(res.chunk.id);
                            onHighlightChunk(parseInt(res.chunk.id));
                          }}
                          className={`p-3 border rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-secondary/90 border-primary ring-1 ring-primary/20 scale-[1.01]" 
                              : "bg-secondary/40 border-border hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs pb-1 mb-1 border-b border-border/40 font-sans">
                            <span className="font-bold text-primary font-mono">Rank #{res.rank} | Chunk #{res.chunk.id}</span>
                            <span className="font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-1.5 py-0.2 rounded text-[9.5px]">
                              Relevance: {res.score}%
                            </span>
                          </div>

                          <p className="line-clamp-2 text-muted-foreground text-[10px] leading-relaxed font-mono">
                            {res.chunk.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeStage === "prompt" && retrievedResults.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-emerald-500/25 bg-emerald-500/5 rounded-xl space-y-2 text-xs">
                  <div className="font-extrabold text-emerald-400 uppercase text-[9px] tracking-wider font-sans">5. Assembled LLM Context Window Prompt</div>
                  <pre className="bg-[#0c0c0f] border border-border/70 p-3.5 rounded-lg text-[9px] font-mono text-zinc-400 overflow-x-auto max-h-36 scrollbar-thin whitespace-pre-wrap leading-normal">
                    {`SYSTEM: Answer the query based ONLY on the following retrieved context:\n\n` +
                     assembledPromptContext + 
                     `\n\nQUERY: ${query}`}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* COLUMN 2: DIAGNOSTICS - "WHY WAS THIS RETRIEVED?" */}
      <div className="flex flex-col h-full glass-panel border border-border bg-card/45 rounded-xl overflow-hidden p-4 space-y-4">
        <div className="pb-2 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold flex items-center space-x-1.5">
            <Info className="h-4 w-4 text-violet-400 animate-pulse" />
            <span>"Why was this retrieved?"</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto text-xs space-y-4 pr-1 scrollbar-thin">
          {selectedResult ? (
            <div className="space-y-4">
              
              {/* Core stats metrics */}
              <div className="grid grid-cols-2 gap-2 text-center font-sans">
                <div className="bg-secondary/40 border border-border p-2 rounded-xl">
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Cosine Value</span>
                  <span className="font-mono font-extrabold text-xs text-primary">
                    {((selectedResult.score / 100) * 2 - 1).toFixed(4)}
                  </span>
                </div>
                <div className="bg-secondary/40 border border-border p-2 rounded-xl">
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Vector Distance</span>
                  <span className="font-mono font-extrabold text-xs text-primary">
                    {selectedResult.dist.toFixed(4)}
                  </span>
                </div>
                <div className="bg-secondary/40 border border-border p-2 rounded-xl">
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Database Rank</span>
                  <span className="font-mono font-extrabold text-xs text-fuchsia-400">
                    #{selectedResult.rank} of {chunks.length}
                  </span>
                </div>
                <div className="bg-secondary/40 border border-border p-2 rounded-xl">
                  <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Chunk overlap</span>
                  <span className="font-mono font-extrabold text-xs text-amber-500">
                    {selectedResult.chunk.overlap} chars
                  </span>
                </div>
              </div>

              {/* Text context snippet */}
              <div className="space-y-1 bg-secondary/15 p-3 border border-border rounded-xl">
                <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">Passage Content</span>
                <p className="font-mono text-[9px] leading-relaxed text-zinc-300 max-h-40 overflow-y-auto scrollbar-thin">
                  {selectedResult.chunk.text}
                </p>
              </div>

              {/* Shared vocabulary keywords match */}
              <div className="space-y-1.5">
                <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider block font-sans">Shared Keywords ({matchingKeywords.length})</span>
                {matchingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {matchingKeywords.map((w, idx) => (
                      <span key={idx} className="text-[9px] bg-primary/10 border border-primary/20 text-primary font-mono px-2 py-0.5 rounded">
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9.5px] text-muted-foreground/60 italic leading-normal font-sans">
                    No shared keywords above 3 characters found. Similarity driven purely by topic vectors.
                  </span>
                )}
              </div>

              {/* Detailed retrieval reasoning explanation card */}
              <div className="p-3 border border-primary/20 bg-primary/5 rounded-xl space-y-1.5 font-sans">
                <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider flex items-center">
                  <Cpu className="h-3.5 w-3.5 mr-1" />
                  DB Retrieval Explanation
                </span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {selectedResult.score >= 85 ? (
                    "This chunk matches the query's conceptual meaning closely. The database identified high similarity between the query keywords and the chunk's topic distribution."
                  ) : selectedResult.score >= 65 ? (
                    "This chunk has moderate relevance. It shares some keywords or a general topic (e.g. Ndas or neural networks), but addresses a slightly different facet of the idea."
                  ) : (
                    "This chunk has low relevance and was outranked by closer contextual neighbors."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground text-xs font-sans">
              <Info className="h-7 w-7 mb-2 opacity-30 text-primary" />
              <span>Perform a vector search and click a retrieved chunk card to view database diagnostics.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
