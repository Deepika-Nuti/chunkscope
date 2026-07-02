"use client";

import React, { useState, useMemo } from "react";
import { Info, HelpCircle, ZoomIn, ZoomOut } from "lucide-react";

interface TokenHeatmapProps {
  originalText: string;
  isLearningMode: boolean;
}

interface BlockDensity {
  index: number;
  start: number;
  end: number;
  charCount: number;
  wordCount: number;
  tokenCount: number;
  compressionRatio: number; // Chars per token
  densityLevel: "low" | "medium" | "high";
  textSnippet: string;
}

export default function TokenHeatmap({ originalText, isLearningMode }: TokenHeatmapProps) {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = Normal, 2 = Detailed (double blocks)
  const [hoveredBlock, setHoveredBlock] = useState<BlockDensity | null>(null);

  // Divide document into equal text blocks and compute density metrics
  const blocks = useMemo(() => {
    if (!originalText) return [];

    // Zoom adjust: Normal uses 32 blocks, Detailed uses 64 blocks
    const numBlocks = zoomLevel === 1 ? 32 : 64;
    const blockSize = Math.max(10, Math.ceil(originalText.length / numBlocks));
    const result: BlockDensity[] = [];

    for (let i = 0; i < numBlocks; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, originalText.length);
      const text = originalText.slice(start, end);
      if (text.length === 0) continue;

      const charCount = text.length;
      const words = text.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      
      // Token estimation: technical chunks (numbers, symbols) have more tokens
      // Standard text is ~4.1 chars per token. If text has many capitals, code syntax, or numbers,
      // it has higher token density (lower chars per token).
      // We calculate a synthetic token estimate that matches this reality.
      const nonAlphanumericCount = text.replace(/[a-zA-Z0-9\s]/g, "").length;
      const numbersCount = text.replace(/[^0-9]/g, "").length;
      
      // Base tokens
      let estimatedTokens = charCount / 4.1;
      // Add penalty for complex tokens (symbols and numbers inflate token counts)
      estimatedTokens += (nonAlphanumericCount * 0.4) + (numbersCount * 0.3);
      const tokenCount = Math.max(1, Math.round(estimatedTokens));

      // Compression ratio: characters per token
      const compressionRatio = tokenCount > 0 ? charCount / tokenCount : 0;

      // Classify density level (characters per token):
      // < 3.8: High Density (many small tokens, code, metadata)
      // 3.8 - 4.4: Medium Density (standard prose)
      // > 4.4: Low Density (repetitive text, whitespace, simple words)
      let densityLevel: "low" | "medium" | "high" = "medium";
      if (compressionRatio < 3.8) {
        densityLevel = "high";
      } else if (compressionRatio > 4.4) {
        densityLevel = "low";
      }

      result.push({
        index: i,
        start,
        end,
        charCount,
        wordCount,
        tokenCount,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        densityLevel,
        textSnippet: text.slice(0, 160) + (text.length > 160 ? "..." : ""),
      });
    }

    return result;
  }, [originalText, zoomLevel]);

  if (!originalText) return null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-4">
      {/* Header controls */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          <span>Token Density Heatmap</span>
        </span>

        {/* Zoom Toggles */}
        <div className="flex items-center space-x-2 border border-border rounded bg-secondary/30 p-0.5">
          <button
            onClick={() => setZoomLevel(1)}
            className={`p-1 text-[9px] font-semibold rounded cursor-pointer ${
              zoomLevel === 1 ? "bg-card text-primary shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Coarse
          </button>
          <button
            onClick={() => setZoomLevel(2)}
            className={`p-1 text-[9px] font-semibold rounded cursor-pointer ${
              zoomLevel === 2 ? "bg-card text-primary shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fine
          </button>
        </div>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            <b>Token density</b> determines database storage requirements. Regions with code syntax, numbers, or formatting have higher token ratios (fewer characters per token) and consume more context window allocations.
          </span>
        </p>
      )}

      {/* Heatmap Grid Layout */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {blocks.map((block) => {
          let bgClass = "";
          let label = "";
          
          if (block.densityLevel === "low") {
            bgClass = "bg-indigo-500/10 border-indigo-500/25 hover:bg-indigo-500/25 text-indigo-400";
            label = "Low";
          } else if (block.densityLevel === "medium") {
            bgClass = "bg-violet-500/25 border-violet-500/40 hover:bg-violet-500/45 text-violet-300";
            label = "Mid";
          } else {
            bgClass = "bg-fuchsia-500/40 border-fuchsia-500/60 hover:bg-fuchsia-500/65 text-fuchsia-200";
            label = "High";
          }

          const isHovered = hoveredBlock?.index === block.index;

          return (
            <div
              key={block.index}
              className={`p-3 rounded-lg border flex flex-col justify-between h-20 cursor-help transition-all relative ${bgClass} ${
                isHovered ? "ring-1 ring-white/50 scale-105" : ""
              }`}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="font-bold">#{block.index}</span>
                <span>{label}</span>
              </div>
              <div className="text-[11px] font-bold font-mono text-center">
                {block.compressionRatio} <span className="text-[8px] font-normal">c/t</span>
              </div>
              <div className="text-[8px] text-muted-foreground/80 text-center truncate">
                Tokens: {block.tokenCount}
              </div>

              {/* Hover Tooltip Overlay */}
              {isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl z-50 pointer-events-none font-sans text-xs space-y-2 leading-relaxed">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="font-bold text-primary">Block #{block.index}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Range: {block.start}-{block.end}c</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-muted-foreground">
                    <div>Words: <b className="text-foreground">{block.wordCount}</b></div>
                    <div>Tokens: <b className="text-foreground">{block.tokenCount}</b></div>
                    <div className="col-span-2">Ratio: <b className="text-foreground">{block.compressionRatio} characters/token</b></div>
                  </div>
                  <div className="text-[10px] bg-secondary/80 p-1.5 rounded italic border border-border/40 text-muted-foreground max-h-16 overflow-y-auto">
                    "{block.textSnippet}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Density Indicator Legend */}
      <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-2">
        <span>Block Grid</span>
        <div className="flex space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-sm"></span>
            <span>Low Density (&gt; 4.4 c/t)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-violet-500/25 border border-violet-500/40 rounded-sm"></span>
            <span>Medium Density (3.8 - 4.4 c/t)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-fuchsia-500/40 border border-fuchsia-500/60 rounded-sm"></span>
            <span>High Density (&lt; 3.8 c/t)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
