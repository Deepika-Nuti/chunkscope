"use client";

import React, { useState, useMemo } from "react";
import { EmbeddedChunk } from "../lib/semantic-fallback";
import { cosineSimilarity } from "../lib/semantic-fallback";
import { HelpCircle, Grid, Sliders, Info } from "lucide-react";

interface SemanticHeatmapProps {
  chunks: EmbeddedChunk[];
  isLearningMode: boolean;
}

export default function SemanticHeatmap({ chunks, isLearningMode }: SemanticHeatmapProps) {
  const [threshold, setThreshold] = useState(65); // Default threshold 65%
  const [windowOffset, setWindowOffset] = useState(0); // Offset pagination
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; score: number } | null>(null);

  const windowSize = 12; // Inspect max 12x12 grid at a time for high resolution

  // Paginated chunks subset
  const visibleChunks = useMemo(() => {
    return chunks.slice(windowOffset, windowOffset + windowSize);
  }, [chunks, windowOffset]);

  // Compute full pairwise similarity matrix for paginated chunks
  const matrixData = useMemo(() => {
    const matrix: number[][] = [];
    
    visibleChunks.forEach((rowChunk, r) => {
      const rowList: number[] = [];
      visibleChunks.forEach((colChunk, c) => {
        const sim = cosineSimilarity(rowChunk.embedding, colChunk.embedding);
        // Scale to 0-100%
        const simPercent = Math.max(0, Math.min(100, Math.round(((sim + 1.0) / 2.0) * 100)));
        rowList.push(simPercent);
      });
      matrix.push(rowList);
    });

    return matrix;
  }, [visibleChunks]);

  const maxOffset = Math.max(0, chunks.length - windowSize);

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center pb-2 border-b border-border gap-3">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Grid className="h-4 w-4 text-violet-400" />
          <span>Chunk-to-Chunk Similarity Matrix</span>
        </span>
        
        {/* Navigation Pagination controls */}
        {chunks.length > windowSize && (
          <div className="flex items-center space-x-2 text-[10px]">
            <button
              disabled={windowOffset === 0}
              onClick={() => setWindowOffset(Math.max(0, windowOffset - windowSize))}
              className="px-2 py-1 bg-secondary border border-border rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
            >
              Prev Page
            </button>
            <span className="font-mono text-muted-foreground">
              {windowOffset + 1}-{Math.min(chunks.length, windowOffset + windowSize)} of {chunks.length}
            </span>
            <button
              disabled={windowOffset >= maxOffset}
              onClick={() => setWindowOffset(Math.min(maxOffset, windowOffset + windowSize))}
              className="px-2 py-1 bg-secondary border border-border rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      {/* Control sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/15 p-3 rounded-lg border border-border/80 text-xs">
        {/* Threshold */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground">Similarity Cutoff Filter</span>
            <span className="font-mono font-bold text-primary">{threshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Index timeline slider */}
        {chunks.length > windowSize && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Focus Index (Document Timeline)</span>
              <span className="font-mono font-bold text-primary">Chunk #{windowOffset}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxOffset}
              step="1"
              value={windowOffset}
              onChange={(e) => setWindowOffset(parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
            />
          </div>
        )}
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            This correlation matrix maps overlap relationships. Darker purple cells represent scores above your cutoff threshold ({threshold}%), signifying highly correlated topic blocks.
          </span>
        </p>
      )}

      {/* Matrix grid table layout */}
      <div className="overflow-x-auto border border-border/80 rounded-xl relative scrollbar-thin">
        <table className="w-full text-center border-collapse text-[10px] font-mono select-none">
          <thead>
            <tr className="bg-secondary/35 border-b border-border font-bold">
              <th className="p-2 border-r border-border bg-secondary/50 font-sans"># ID</th>
              {visibleChunks.map((c) => (
                <th key={c.id} className="p-2 border-r border-border text-primary font-bold min-w-10">
                  #{c.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleChunks.map((rowChunk, r) => (
              <tr key={rowChunk.id} className="border-b border-border/60">
                <td className="p-2 border-r border-border font-bold bg-secondary/20 text-primary font-mono text-[9px] min-w-12">
                  #{rowChunk.id}
                </td>
                {visibleChunks.map((colChunk, c) => {
                  const score = matrixData[r][c];
                  const isFiltered = score < threshold;
                  const isIdentity = rowChunk.id === colChunk.id;

                  // Saturation mapping for HSL similarity color
                  // Map score from [threshold, 100] to opacity [0.1, 0.8]
                  const opacity = isFiltered ? 0.04 : 0.15 + ((score - threshold) / (100 - threshold)) * 0.65;
                  
                  let style: React.CSSProperties = {};
                  if (!isFiltered) {
                    style.backgroundColor = isIdentity 
                      ? "rgba(99, 102, 241, 0.45)" 
                      : `hsla(263, 85%, 65%, ${opacity})`;
                    style.color = score > 85 ? "#ffffff" : "var(--foreground)";
                  } else {
                    style.color = "rgba(255,255,255,0.06)";
                  }

                  const isCellHovered = hoveredCell && hoveredCell.row === r && hoveredCell.col === c;

                  return (
                    <td
                      key={colChunk.id}
                      style={style}
                      onMouseEnter={() => setHoveredCell({ row: r, col: c, score })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-2 border-r border-border/60 transition-all font-bold ${
                        isCellHovered ? "ring-1 ring-white/50 scale-105" : ""
                      }`}
                    >
                      {isFiltered ? "-" : `${score}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hover tooltip metadata details */}
      {hoveredCell && (
        <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl text-[10.5px] font-sans leading-normal animate-fade-in">
          <div className="flex justify-between border-b border-border/50 pb-1 mb-1.5 font-mono text-[9px] font-bold text-muted-foreground">
            <span>PAIR CORRELATION</span>
            <span>Chunk #{visibleChunks[hoveredCell.row].id} ↔ Chunk #{visibleChunks[hoveredCell.col].id}</span>
          </div>
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-primary font-mono mr-1">Chunk #{visibleChunks[hoveredCell.row].id}:</span>
              <span className="text-muted-foreground">"{visibleChunks[hoveredCell.row].text.slice(0, 80)}..."</span>
            </div>
            <div className="pt-1">
              <span className="font-semibold text-primary font-mono mr-1">Chunk #{visibleChunks[hoveredCell.col].id}:</span>
              <span className="text-muted-foreground">"{visibleChunks[hoveredCell.col].text.slice(0, 80)}..."</span>
            </div>
            <div className="pt-1.5 flex justify-between font-mono text-[10px] font-bold">
              <span>Cosine Proximity Score:</span>
              <span className="text-primary">{hoveredCell.score}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
