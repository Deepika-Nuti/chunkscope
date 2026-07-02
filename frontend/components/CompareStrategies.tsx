"use client";

import React from "react";
import { Sparkles, HelpCircle } from "lucide-react";

interface CompareStrategiesProps {
  isLearningMode: boolean;
  activeStrategy: string;
}

interface StrategyStats {
  id: string;
  name: string;
  chunks: number;
  coherence: number; // percentage
  retrieval: number; // percentage
  storage: string;
  pros: string;
  cons: string;
}

const STRATEGIES_DATA: StrategyStats[] = [
  {
    id: "fixed",
    name: "Fixed Size",
    chunks: 58,
    coherence: 45,
    retrieval: 60,
    storage: "Medium",
    pros: "Fast, uniform chunk sizes simplify model parameters.",
    cons: "Splits sentences in half, causing severe context fragmentation."
  },
  {
    id: "recursive",
    name: "Recursive Character",
    chunks: 32,
    coherence: 92,
    retrieval: 88,
    storage: "Low",
    pros: "Keeps paragraphs & sentences together; high semantic preservation.",
    cons: "Uneven chunk sizes require database models that support padding."
  },
  {
    id: "sentence",
    name: "Sentence Chunking",
    chunks: 24,
    coherence: 85,
    retrieval: 80,
    storage: "Low",
    pros: "Preserves individual grammatical ideas cleanly.",
    cons: "Lacks paragraph-level macro context for complex reasoning."
  },
  {
    id: "paragraph",
    name: "Paragraph Chunking",
    chunks: 12,
    coherence: 95,
    retrieval: 70,
    storage: "Very Low",
    pros: "Preserves full document structure and paragraphs.",
    cons: "Overly large blocks can dilute vector search precision."
  },
  {
    id: "sliding",
    name: "Sliding Window",
    chunks: 72,
    coherence: 70,
    retrieval: 94,
    storage: "High",
    pros: "Highest overlap; ensures no fact is split across indices.",
    cons: "Massive token duplication inflates database hosting costs."
  }
];

export default function CompareStrategies({ isLearningMode, activeStrategy }: CompareStrategiesProps) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Strategy Matrix: Visualizing RAG Trade-offs</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          Compare 5 Split Styles
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2.5 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Every chunking strategy has trade-offs. <b>Fixed split</b> yields high chunk density but destroys context. <b>Recursive split</b> balances semantic preservation and storage size.
          </span>
        </p>
      )}

      {/* Comparison Grid */}
      <div className="space-y-4">
        {STRATEGIES_DATA.map((strat) => {
          const isActive = strat.id === activeStrategy;

          return (
            <div
              key={strat.id}
              className={`p-4 border rounded-xl space-y-3 transition-all ${
                isActive ? "border-primary bg-primary/5" : "border-border bg-secondary/15"
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground flex items-center space-x-2">
                  <span>{strat.name}</span>
                  {isActive && (
                    <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary-foreground font-bold px-1.5 py-0.2 rounded font-sans uppercase">
                      Active
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Storage Cost: <b className="text-foreground">{strat.storage}</b>
                </span>
              </div>

              {/* Bar Visualizers */}
              <div className="space-y-2 text-[10px] font-mono">
                {/* Coherence */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Semantic Coherence (preserves sentence meaning)</span>
                    <span className="font-bold text-foreground">{strat.coherence}%</span>
                  </div>
                  <div className="w-full h-2 bg-background border border-border/50 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${strat.coherence}%` }}
                      className={`h-full ${strat.coherence > 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                  </div>
                </div>

                {/* Retrieval Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Retrieval Precision (limits noise in vector queries)</span>
                    <span className="font-bold text-foreground">{strat.retrieval}%</span>
                  </div>
                  <div className="w-full h-2 bg-background border border-border/50 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${strat.retrieval}%` }}
                      className={`h-full ${strat.retrieval > 80 ? "bg-indigo-500" : "bg-amber-500"}`}
                    />
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] pt-1">
                <div>
                  <span className="font-bold text-emerald-400 block">✓ STRENGTHS:</span>
                  <span className="text-muted-foreground">{strat.pros}</span>
                </div>
                <div>
                  <span className="font-bold text-rose-400 block">✗ WEAKNESSES:</span>
                  <span className="text-muted-foreground">{strat.cons}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
