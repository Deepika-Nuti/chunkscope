"use client";

import React, { useState, useMemo } from "react";
import { Chunk } from "../lib/fallback-engine";
import { getChunkColor } from "./LiveVisualizer";
import { AlertCircle, ToggleLeft, ToggleRight, Layers, Eye, RefreshCw, BarChart2 } from "lucide-react";

interface VisualOverlapExplorerProps {
  chunks: Chunk[];
  originalTextLength: number;
  isLearningMode: boolean;
}

export default function VisualOverlapExplorer({
  chunks,
  originalTextLength,
  isLearningMode,
}: VisualOverlapExplorerProps) {
  const [showOverlaysOnly, setShowOverlaysOnly] = useState(false);
  const [hoveredBin, setHoveredBin] = useState<{ index: number; count: number; range: string } | null>(null);

  // 1. Calculate Overlap Metrics
  const metrics = useMemo(() => {
    if (chunks.length === 0 || originalTextLength === 0) {
      return { duplicatedTokens: 0, redundancyRatio: 0, contextPreservation: 0 };
    }

    // Sum of all overlapping segments
    const totalOverlapChars = chunks.reduce((sum, c) => sum + c.overlap_next, 0);
    const totalCharsInChunks = chunks.reduce((sum, c) => sum + c.char_count, 0);
    
    // Duplicated token estimate
    const duplicatedTokens = Math.round(totalOverlapChars / 4.1);
    
    // Redundancy ratio: percentage of text duplicated relative to original length
    const redundancyRatio = originalTextLength > 0 ? (totalOverlapChars / originalTextLength) * 100 : 0;

    // Context preservation score:
    // If overlap is 0% -> 35% (severe risk of word clipping)
    // If overlap is 10%-20% of avg chunk size -> 95%-98% (optimal)
    // If overlap is >25% of avg chunk size -> 100% (but extremely redundant)
    const avgChunkSize = chunks.reduce((sum, c) => sum + c.char_count, 0) / chunks.length;
    const avgOverlap = chunks.reduce((sum, c) => sum + (c.overlap_prev + c.overlap_next) / 2, 0) / chunks.length;
    const overlapRatio = avgChunkSize > 0 ? avgOverlap / avgChunkSize : 0;
    
    let contextPreservation = 0;
    if (overlapRatio === 0) {
      contextPreservation = 35;
    } else if (overlapRatio < 0.1) {
      contextPreservation = 35 + (overlapRatio / 0.1) * 55; // scales up to 90%
    } else if (overlapRatio <= 0.22) {
      contextPreservation = 90 + ((overlapRatio - 0.1) / 0.12) * 8; // scales up to 98%
    } else {
      contextPreservation = 99; // caps at 99%
    }

    return {
      duplicatedTokens,
      redundancyRatio: Math.round(redundancyRatio * 10) / 10,
      contextPreservation: Math.round(contextPreservation),
    };
  }, [chunks, originalTextLength]);

  // 2. Generate Heatmap data (split document into 60 bins)
  const heatmapBins = useMemo(() => {
    if (chunks.length === 0 || originalTextLength === 0) return [];
    
    const numBins = 60;
    const binSize = originalTextLength / numBins;
    const bins = [];

    for (let b = 0; b < numBins; b++) {
      const binStart = b * binSize;
      const binEnd = (b + 1) * binSize;

      // Find how many chunks overlap with this character bin
      const overlappingChunks = chunks.filter(
        (c) => c.start_char < binEnd && c.end_char > binStart
      );
      
      bins.push({
        index: b,
        count: overlappingChunks.length,
        range: `${Math.round(binStart)}-${Math.round(binEnd)} chars`,
      });
    }

    return bins;
  }, [chunks, originalTextLength]);

  if (chunks.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Layers className="h-4 w-4 text-amber-400" />
          <span>Semantic Overlap & Redundancy Explorer</span>
        </span>
        <button
          onClick={() => setShowOverlaysOnly(!showOverlaysOnly)}
          className="text-[10px] bg-secondary border border-border px-2 py-1 rounded-md cursor-pointer transition-all hover:bg-secondary/70 flex items-center space-x-1.5"
        >
          {showOverlaysOnly ? <Eye className="h-3 w-3 text-primary" /> : <Eye className="h-3 w-3" />}
          <span>{showOverlaysOnly ? "Isolate Overlaps" : "Highlight Overlaps"}</span>
        </button>
      </div>

      {/* Metrics Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Redundancy Ratio */}
        <div className="glass-panel p-3.5 rounded-lg border border-border bg-secondary/10 flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Index Redundancy Ratio
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold font-mono text-amber-400">
              {metrics.redundancyRatio}%
            </span>
            <span className="text-[9px] text-muted-foreground">bloat</span>
          </div>
          <p className="text-[9px] text-muted-foreground leading-normal">
            Reflects index duplication overhead. High percentages indicate wasted token capacity.
          </p>
        </div>

        {/* Total Duplicated Tokens */}
        <div className="glass-panel p-3.5 rounded-lg border border-border bg-secondary/10 flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Duplicated Tokens
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold font-mono text-amber-400">
              ~{metrics.duplicatedTokens}
            </span>
            <span className="text-[9px] text-muted-foreground">tokens</span>
          </div>
          <p className="text-[9px] text-muted-foreground leading-normal">
            Total repeated information stored in vectors to prevent document boundaries fragmentation.
          </p>
        </div>

        {/* Context Preservation Percentage */}
        <div className="glass-panel p-3.5 rounded-lg border border-border bg-secondary/10 flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Context Preservation
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {metrics.contextPreservation}%
            </span>
            <span className="text-[9px] text-muted-foreground">safety</span>
          </div>
          <p className="text-[9px] text-muted-foreground leading-normal">
            Likelihood that transitions, descriptors, and sentence boundaries are preserved contextually.
          </p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground uppercase">
          <span>Overlap Density Heatmap (Document Span)</span>
          {hoveredBin && (
            <span className="text-primary font-mono lowercase">
              {hoveredBin.range}: {hoveredBin.count} active chunks
            </span>
          )}
        </div>
        
        {/* Heatmap grid row */}
        <div className="flex w-full gap-0.5 p-1.5 bg-secondary/20 border border-border/80 rounded-lg">
          {heatmapBins.map((bin) => {
            // Colors:
            // 0 active chunks: bg-zinc-900
            // 1 active chunk: bg-indigo-500/20 (normal)
            // 2 active chunks: bg-amber-500/40 (mild overlap)
            // 3+ active chunks: bg-rose-500/70 (dense overlap redundancy)
            let colorClass = "bg-zinc-800/40";
            if (bin.count === 1) {
              colorClass = "bg-indigo-500/25";
            } else if (bin.count === 2) {
              colorClass = "bg-amber-500/50";
            } else if (bin.count >= 3) {
              colorClass = "bg-rose-500/80";
            }

            // If we are isolating overlaps, dim the normal chunks
            if (showOverlaysOnly && bin.count === 1) {
              colorClass = "bg-zinc-800/20";
            }

            return (
              <div
                key={bin.index}
                className={`flex-1 h-8 rounded-sm transition-all duration-100 hover:ring-1 hover:ring-white/40 cursor-crosshair ${colorClass}`}
                onMouseEnter={() => setHoveredBin(bin)}
                onMouseLeave={() => setHoveredBin(null)}
              />
            );
          })}
        </div>
        
        {/* Heatmap Legend */}
        <div className="flex justify-between items-center text-[9px] text-muted-foreground">
          <span>Start (0c)</span>
          <div className="flex space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-zinc-850 border border-border/20 rounded-sm"></span>
              <span>No Chunk</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-indigo-500/25 rounded-sm"></span>
              <span>Standard (1 Ch)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-amber-500/50 rounded-sm"></span>
              <span>Mild Overlap (2 Ch)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-rose-500/80 rounded-sm"></span>
              <span>Dense Redundant (3+ Ch)</span>
            </span>
          </div>
          <span>End ({originalTextLength}c)</span>
        </div>
      </div>
    </div>
  );
}
