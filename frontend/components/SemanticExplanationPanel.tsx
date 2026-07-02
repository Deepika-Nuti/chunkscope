"use client";

import React, { useState, useMemo } from "react";
import { EmbeddedChunk, getSemanticExplanation } from "../lib/semantic-fallback";
import { Sparkles, HelpCircle, ArrowRightLeft, CheckCircle2, Info } from "lucide-react";

interface SemanticExplanationPanelProps {
  chunks: EmbeddedChunk[];
  isLearningMode: boolean;
}

export default function SemanticExplanationPanel({ chunks, isLearningMode }: SemanticExplanationPanelProps) {
  const [chunkAId, setChunkAId] = useState<number>(0);
  const [chunkBId, setChunkBId] = useState<number>(Math.min(1, chunks.length - 1));

  // Safeguard bounds on text switches
  const safeA = Math.min(chunkAId, chunks.length - 1);
  const safeB = Math.min(chunkBId, chunks.length - 1);
  
  const chunkA = chunks[safeA];
  const chunkB = chunks[safeB];

  // Calculate comparison report using local helper
  const report = useMemo(() => {
    if (!chunkA || !chunkB) return null;
    return getSemanticExplanation(chunkA, chunkB, chunkA.embedding, chunkB.embedding);
  }, [chunkA, chunkB]);

  if (chunks.length <= 1) {
    return (
      <div className="h-44 flex items-center justify-center text-center p-6 text-muted-foreground text-xs glass-panel border border-border bg-card/25 rounded-xl">
        Upload a larger document to compare different semantic segments.
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <ArrowRightLeft className="h-4 w-4 text-violet-400" />
          <span>Why Are These Chunks Similar?</span>
        </span>
        <span className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded font-mono uppercase text-muted-foreground">
          Pair Comparison
        </span>
      </div>

      {/* Selectors Row */}
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex-1 space-y-1">
          <span className="text-muted-foreground font-semibold block">Chunk A:</span>
          <select
            value={chunkAId}
            onChange={(e) => setChunkAId(parseInt(e.target.value))}
            className="w-full bg-secondary border border-border rounded-lg p-2 outline-none focus:border-primary/50 text-foreground cursor-pointer font-mono"
          >
            {chunks.map((c) => (
              <option key={c.id} value={c.id}>
                Chunk #{c.id} ({c.text.slice(0, 30)}...)
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-muted-foreground font-semibold block">Chunk B:</span>
          <select
            value={chunkBId}
            onChange={(e) => setChunkBId(parseInt(e.target.value))}
            className="w-full bg-secondary border border-border rounded-lg p-2 outline-none focus:border-primary/50 text-foreground cursor-pointer font-mono"
          >
            {chunks.map((c) => (
              <option key={c.id} value={c.id}>
                Chunk #{c.id} ({c.text.slice(0, 30)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Report display */}
      {report && (
        <div className="space-y-4">
          {/* Similarity progress metric */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-secondary/35 border border-border/80 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] font-sans text-muted-foreground uppercase">Cosine Proximity</span>
              <span className="text-xl font-bold text-primary mt-1">{report.similarity}%</span>
            </div>
            <div className="bg-secondary/35 border border-border/80 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] font-sans text-muted-foreground uppercase">Euclidean Distance</span>
              <span className="text-xl font-bold text-foreground mt-1">{report.euclidean_distance.toFixed(4)}</span>
            </div>
          </div>

          {/* Trigger list */}
          <div className="bg-secondary/25 border border-border p-4 rounded-xl space-y-2">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-primary animate-pulse" />
              Shared Semantic Features
            </h5>
            <div className="space-y-1.5 text-[11px] font-medium leading-normal text-foreground">
              {report.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overlapping words */}
          {report.overlap_words.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Top Keyword Intersections
              </span>
              <div className="flex flex-wrap gap-1">
                {report.overlap_words.map((word) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 bg-[#020204] border border-border rounded font-mono text-[10px]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Explanation paragraph */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground flex items-center mb-1 text-[11px]">
              <Info className="h-4 w-4 mr-1 text-primary" />
              Under the Hood Analysis
            </span>
            <p className="text-[10.5px]">{report.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
