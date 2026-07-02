"use client";

import React, { useMemo } from "react";
import { EmbeddedChunk } from "../lib/semantic-fallback";
import { cosineSimilarity, euclideanDistance } from "../lib/semantic-fallback";
import { Link2, Search, Sparkles, HelpCircle } from "lucide-react";

interface SimilarityExplorerProps {
  selectedChunk: EmbeddedChunk | null;
  allChunks: EmbeddedChunk[];
  onSelectChunk: (id: number) => void;
  isLearningMode: boolean;
}

export default function SimilarityExplorer({
  selectedChunk,
  allChunks,
  onSelectChunk,
  isLearningMode,
}: SimilarityExplorerProps) {
  // Compute similarities between selected chunk and all others
  const similarities = useMemo(() => {
    if (!selectedChunk || allChunks.length <= 1) return [];

    const list = allChunks
      .filter((c) => c.id !== selectedChunk.id)
      .map((c) => {
        const sim = cosineSimilarity(selectedChunk.embedding, c.embedding);
        const dist = euclideanDistance(selectedChunk.embedding, c.embedding);
        
        // Scale to 0-100% similarity score
        const simPercent = Math.max(0, Math.min(100, Math.round(((sim + 1.0) / 2.0) * 100)));

        return {
          id: c.id,
          text: c.text,
          cosine: sim,
          distance: dist,
          similarity: simPercent,
        };
      });

    // Sort by similarity descending
    return list.sort((a, b) => b.cosine - a.cosine);
  }, [selectedChunk, allChunks]);

  if (!selectedChunk) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs glass-panel border border-border bg-card/25 rounded-xl">
        Select a chunk in the scatter plot to inspect similar neighbors.
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Link2 className="h-4 w-4 text-primary" />
          <span>Nearest Semantic Neighbors (Chunk #{selectedChunk.id})</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold">
          K = {similarities.length} matches
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            <b>Cosine Similarity</b> calculates the angle between vector embeddings. If the angle is 0, they share the exact topic context, yielding a high similarity rating.
          </span>
        </p>
      )}

      {/* Neighbors list */}
      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
        {similarities.length === 0 ? (
          <div className="text-center text-muted-foreground text-[10px] py-4">
            Upload larger documents to catalog neighboring vectors.
          </div>
        ) : (
          similarities.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectChunk(parseInt(item.id))}
              className="p-3 bg-secondary/35 hover:bg-secondary/60 border border-border rounded-xl cursor-pointer transition-all flex flex-col space-y-2 text-xs"
            >
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-primary">Chunk #{item.id}</span>
                <div className="flex space-x-2 text-[9px] text-muted-foreground">
                  <span>Dist: {item.distance.toFixed(3)}</span>
                  <span>Sim: <b className="text-foreground">{item.similarity}%</b></span>
                </div>
              </div>

              {/* Progress bar similarity gauge */}
              <div className="w-full h-1.5 bg-background border border-border/60 rounded-full overflow-hidden">
                <div
                  style={{ width: `${item.similarity}%` }}
                  className="h-full bg-primary"
                />
              </div>

              <p className="text-[10px] text-muted-foreground font-mono truncate">
                "{item.text}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
