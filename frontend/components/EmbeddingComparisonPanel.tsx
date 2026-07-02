"use client";

import React from "react";
import { Info, HelpCircle, Layers, Cpu, TrendingUp } from "lucide-react";

interface EmbeddingComparisonPanelProps {
  isLearningMode: boolean;
}

export default function EmbeddingComparisonPanel({ isLearningMode }: EmbeddingComparisonPanelProps) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Layers className="h-4 w-4 text-violet-400" />
          <span>Embedding Models Comparative Analysis</span>
        </span>
        <span className="text-[9px] bg-secondary border border-border px-2 py-0.5 rounded font-mono uppercase text-muted-foreground">
          Model Specs
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Selecting an embedding model involves managing retrieval accuracy, memory sizes, and API costs. Compare standard sentence-transformers models below.
          </span>
        </p>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-border/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/40 border-b border-border text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="p-2.5">Feature</th>
              <th className="p-2.5">all-MiniLM-L6-v2</th>
              <th className="p-2.5">all-mpnet-base-v2</th>
              <th className="p-2.5">Browser Fallback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono text-[10px]">
            <tr>
              <td className="p-2.5 font-bold font-sans text-muted-foreground">Dimensions</td>
              <td className="p-2.5 text-foreground font-bold">384</td>
              <td className="p-2.5 text-foreground font-bold">768</td>
              <td className="p-2.5 text-primary">384</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold font-sans text-muted-foreground">Speed (Latency)</td>
              <td className="p-2.5 text-emerald-400">Fast (~15ms)</td>
              <td className="p-2.5 text-amber-400">Medium (~60ms)</td>
              <td className="p-2.5 text-emerald-400">Instant (0ms)</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold font-sans text-muted-foreground">Memory Usage</td>
              <td className="p-2.5 text-emerald-400">Low (120MB)</td>
              <td className="p-2.5 text-rose-400">High (420MB)</td>
              <td className="p-2.5 text-emerald-400">Zero (0MB)</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold font-sans text-muted-foreground">Semantic Quality</td>
              <td className="p-2.5 text-foreground">Good</td>
              <td className="p-2.5 text-indigo-400 font-bold">Better</td>
              <td className="p-2.5 text-muted-foreground/60 italic">Simulated</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Concept Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1 font-semibold text-foreground">
            <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Dimensionality</span>
          </div>
          <p className="text-muted-foreground text-[10.5px] leading-relaxed">
            The dimension count (e.g. 384 floats) determines the coordinate thickness. More dimensions allow capturing minor context details but multiply vector search indexing overheads.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-1 font-semibold text-foreground">
            <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Speed vs Accuracy</span>
          </div>
          <p className="text-muted-foreground text-[10.5px] leading-relaxed">
            While MPNet has higher semantic precision, MiniLM is 4x faster and consumes less RAM. In production RAG, MiniLM is often chosen to lower latency.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-1 font-semibold text-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>RAG Storage Cost</span>
          </div>
          <p className="text-muted-foreground text-[10.5px] leading-relaxed">
            Larger dimensions require wider storage (RAM/Disk) inside vector databases like Chroma or Pinecone, scaling your hosting costs proportionally.
          </p>
        </div>
      </div>
    </div>
  );
}
