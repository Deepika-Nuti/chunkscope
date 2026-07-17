"use client";

import React, { useState, useMemo } from "react";
import { simulateChunking, ChunkingResult } from "../lib/fallback-engine";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";
import { BarChart2, Layers, Cpu, HelpCircle, DollarSign, Timer, AlertCircle } from "lucide-react";

interface BenchmarkCompareProps {
  originalText: string;
  isLearningMode: boolean;
}

interface StrategyBenchmark {
  id: string;
  name: string;
  chunks: any[];
  chunkCount: number;
  avgSize: number;
  avgTokens: number;
  overlapPercent: number;
  cost: number; // estimated cost in millicents
  speed: number;
  retrievalScore: number;
  coherence: number;
}

export default function BenchmarkCompare({ originalText, isLearningMode }: BenchmarkCompareProps) {
  const [hoveredStrategyId, setHoveredStrategyId] = useState<string | null>(null);

  // Compute benchmarks simultaneously in browser
  const benchmarksList = useMemo((): StrategyBenchmark[] => {
    if (!originalText) return [];

    const textLength = originalText.length;
    
    // Core parameters mapping
    const strategies = [
      { id: "fixed", name: "Fixed Size Splitter", params: { chunk_size: 500, chunk_overlap: 100 } },
      { id: "recursive", name: "Recursive Character", params: { chunk_size: 500, chunk_overlap: 100 } },
      { id: "sentence", name: "Sentence Splitter", params: { sentences_per_chunk: 3 } },
      { id: "paragraph", name: "Paragraph Splitter", params: { paragraphs_per_chunk: 1 } },
      { id: "sliding", name: "Sliding Word Window", params: { window_size: 100, stride: 50 } },
    ];

    return strategies.map((strat) => {
      const res = simulateChunking(originalText, strat.id, strat.params);
      const chunksList = res.chunks;
      const stats = res.statistics;

      // Overlap % estimation
      const totalOverlapChars = chunksList.reduce((sum, c) => sum + c.overlap_next, 0);
      const overlapPercent = textLength > 0 ? (totalOverlapChars / textLength) * 100 : 0;

      // Cost estimation based on tokens ($0.0001 per 1K tokens standard OpenAI scale)
      const totalEstTokens = chunksList.reduce((sum, c) => sum + c.token_count, 0);
      const cost = totalEstTokens * 0.0001; // cost in millicents

      // Retrieval quality estimate (modeled logic)
      let retrievalScore = 70;
      let coherence = 60;
      
      if (strat.id === "fixed") {
        retrievalScore = 55; // splits contexts
        coherence = 40;
      } else if (strat.id === "recursive") {
        retrievalScore = 88; // preserves clauses
        coherence = 90;
      } else if (strat.id === "sentence") {
        retrievalScore = 80;
        coherence = 85;
      } else if (strat.id === "paragraph") {
        retrievalScore = 70; // large blocks dilute vector weights
        coherence = 95;
      } else if (strat.id === "sliding") {
        retrievalScore = 95; // high overlap prevents fact splitting
        coherence = 75;
      }

      return {
        id: strat.id,
        name: strat.name,
        chunks: chunksList,
        chunkCount: chunksList.length,
        avgSize: Math.round(stats.avg_chunk_size),
        avgTokens: Math.round(stats.avg_token_count),
        overlapPercent: Math.round(overlapPercent * 10) / 10,
        cost: Math.round(cost * 1000) / 1000,
        speed: stats.processing_time_ms,
        retrievalScore,
        coherence,
      };
    });
  }, [originalText]);

  if (!originalText || benchmarksList.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-6 select-none">
      
      {/* Title */}
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <BarChart2 className="h-4 w-4 text-violet-400 animate-pulse" />
          <span>Strategy Benchmark Comparison Lab</span>
        </span>
        <span className="text-[9px] text-muted-foreground font-mono">
          5 Strategies Compared Live
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2.5 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Compare partition styles below. Notice how <b>Fixed splitting</b> yields uniform sizes but poor retrieval. <b>Sliding word window</b> yields maximum overlap but incurs a higher embedding cost overhead.
          </span>
        </p>
      )}

      {/* Stacked visual chunk split partition tracks */}
      <div className="space-y-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
          Document Partition Tracks Timeline
        </span>
        
        <div className="space-y-3 bg-secondary/10 p-3.5 border border-border/80 rounded-xl">
          {benchmarksList.map((bench) => {
            const isHovered = hoveredStrategyId === bench.id;
            return (
              <div
                key={bench.id}
                onMouseEnter={() => setHoveredStrategyId(bench.id)}
                onMouseLeave={() => setHoveredStrategyId(null)}
                className={`space-y-1.5 transition-all duration-100 ${isHovered ? "scale-[1.01]" : ""}`}
              >
                <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                  <span className={isHovered ? "text-primary font-bold" : ""}>{bench.name}</span>
                  <span className="font-mono text-[9px]">{bench.chunkCount} blocks | Avg ~{bench.avgTokens} tokens</span>
                </div>
                
                {/* Horizontal relative blocks container */}
                <div className="w-full h-6 bg-zinc-900/60 rounded-md border border-border/40 relative overflow-hidden flex">
                  {bench.chunks.length === 0 ? (
                    <div className="text-[8px] text-muted-foreground/45 flex items-center justify-center w-full">Empty Track</div>
                  ) : (
                    bench.chunks.slice(0, 45).map((chunk, idx) => {
                      const textLength = originalText.length || 1;
                      const widthPercent = ((chunk.end_char - chunk.start_char) / textLength) * 100;
                      
                      // For Sliding window: we stack them slightly offset or staggered
                      let leftPercent = (chunk.start_char / textLength) * 100;
                      
                      const cColor = getChunkColor(chunk.id, isHovered ? 0.35 : 0.15);
                      const bColor = getChunkBorderColor(chunk.id);

                      // Cap width at 100% just in case of boundaries issues
                      const styleWidth = Math.min(100, Math.max(1, widthPercent));

                      return (
                        <div
                          key={chunk.id}
                          style={{
                            width: `${styleWidth}%`,
                            backgroundColor: cColor,
                            borderColor: bColor,
                            borderRightWidth: "1.5px",
                          }}
                          className="h-full border-r border-dashed shrink-0 hover:bg-primary/20 transition-all flex items-center justify-center text-[7px] font-mono text-zinc-500 hover:text-white"
                          title={`Chunk #${chunk.id} (${chunk.start_char}-${chunk.end_char} chars)`}
                        >
                          {bench.chunkCount < 15 && `#${chunk.id}`}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark metrics table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl">
        <table className="w-full text-left border-collapse text-[10.5px] select-none">
          <thead>
            <tr className="bg-secondary/45 border-b border-border text-muted-foreground font-semibold text-[9px] uppercase tracking-wider">
              <th className="p-3">Strategy Style</th>
              <th className="p-3">Chunks Count</th>
              <th className="p-3">Avg Tokens</th>
              <th className="p-3">Overlap %</th>
              <th className="p-3">Retrieval safety</th>
              <th className="p-3">Embedding cost</th>
            </tr>
          </thead>
          <tbody>
            {benchmarksList.map((bench) => {
              const isHovered = hoveredStrategyId === bench.id;
              
              return (
                <tr
                  key={bench.id}
                  onMouseEnter={() => setHoveredStrategyId(bench.id)}
                  onMouseLeave={() => setHoveredStrategyId(null)}
                  className={`border-b border-border/60 transition-colors ${
                    isHovered ? "bg-primary/5 text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <td className="p-3 font-semibold text-foreground flex items-center space-x-1.5">
                    <span>{bench.name}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-zinc-300">{bench.chunkCount}</td>
                  <td className="p-3 font-mono">~{bench.avgTokens}t</td>
                  <td className="p-3 font-mono text-amber-500">{bench.overlapPercent}%</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold ${
                        bench.retrievalScore >= 85 
                          ? "text-emerald-400" 
                          : bench.retrievalScore >= 70 
                          ? "text-indigo-400" 
                          : "text-amber-400"
                      }`}>
                        {bench.retrievalScore}%
                      </span>
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden border border-border/30">
                        <div
                          style={{ width: `${bench.retrievalScore}%` }}
                          className={`h-full ${
                            bench.retrievalScore >= 85 
                              ? "bg-emerald-500" 
                              : bench.retrievalScore >= 70 
                              ? "bg-indigo-500" 
                              : "bg-amber-500"
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[9px] text-zinc-400">
                    ${bench.cost.toFixed(5)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
