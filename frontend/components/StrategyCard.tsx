"use client";

import React from "react";
import { Info } from "lucide-react";

export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  useCases: string;
  complexity: "Low" | "Medium" | "High";
}

export const STRATEGIES: StrategyInfo[] = [
  {
    id: "fixed",
    name: "Fixed Size Chunking",
    description: "Splits documents into equal character blocks. Ignores syntactic structures like words, sentences, or paragraphs.",
    pros: ["Extremely fast computation", "Predictable chunk sizes", "Easy to implement"],
    cons: ["Splits words and sentences in half", "Lacks context integrity", "Poor semantic representation"],
    useCases: "Basic testing, simple key-value lookups, raw character-level tasks.",
    complexity: "Low",
  },
  {
    id: "recursive",
    name: "Recursive Character",
    description: "Recommended default. Splits text recursively using double newlines, single newlines, and spaces to keep paragraphs and sentences intact.",
    pros: ["Respects document layout structures", "Keeps complete thoughts together", "Highly adjustable"],
    cons: ["Slightly slower than fixed-size", "Chunk sizes can be slightly variable"],
    useCases: "General purpose RAG, articles, essays, user-facing documentation.",
    complexity: "Medium",
  },
  {
    id: "sentence",
    name: "Sentence Chunking",
    description: "Splits text at sentence boundaries. Groups a configurable number of full sentences into each chunk.",
    pros: ["Ensures full semantic thoughts are preserved", "Never splits words or sentences", "Improves embedding search accuracy"],
    cons: ["Variable character chunk size", "Slightly complex sentence parsing dependencies"],
    useCases: "Conversational agents, question-answering systems, semantic search.",
    complexity: "Medium",
  },
  {
    id: "paragraph",
    name: "Paragraph Chunking",
    description: "Groups text blocks split by double newlines. Highly effective for documents where each paragraph covers a single unified topic.",
    pros: ["Strong semantic coherence", "Maintains logical paragraph structure", "No overlap fragmentation"],
    cons: ["Highly dependent on author's formatting style", "Paragraph sizes can vary drastically"],
    useCases: "Legal briefs, academic papers, books, manuals with clear paragraph structures.",
    complexity: "Low",
  },
  {
    id: "sliding",
    name: "Sliding Window Chunking",
    description: "Moves a fixed-size word/token window by a set stride. High density overlaps for continuous text scanning.",
    pros: ["No gaps in information search coverage", "Controls token density precisely", "Excellent similarity overlap retrieval"],
    cons: ["Generates many redundant chunks", "Requires more vector storage"],
    useCases: "Dense search, keyword scanning, embeddings requiring fine-grained sentence overlap.",
    complexity: "High",
  },
];

interface StrategyCardProps {
  selectedStrategy: string;
  onSelect: (id: string) => void;
  isLearningMode: boolean;
}

export default function StrategyCard({ selectedStrategy, onSelect, isLearningMode }: StrategyCardProps) {
  const activeStrat = STRATEGIES.find((s) => s.id === selectedStrategy) || STRATEGIES[0];

  return (
    <div className="space-y-3">
      {/* Compact Dropdown */}
      <select
        value={selectedStrategy}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-[#121214] border border-border hover:border-primary/50 rounded-xl p-2.5 outline-none text-xs font-semibold text-foreground cursor-pointer transition-all"
      >
        {STRATEGIES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.complexity} Complexity)
          </option>
        ))}
      </select>

      {/* Description Panel */}
      <div className="bg-[#0b0b0d]/50 border border-border p-3.5 rounded-xl text-[10.5px] leading-relaxed text-muted-foreground space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground text-[11px] block">{activeStrat.name}</span>
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
            activeStrat.complexity === "Low"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : activeStrat.complexity === "Medium"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {activeStrat.complexity} Complexity
          </span>
        </div>
        
        <p className="text-muted-foreground/80 leading-normal">{activeStrat.description}</p>
        
        <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-3 text-[9.5px]">
          <div>
            <span className="font-bold text-emerald-400 block mb-0.5">✓ STRENGTHS:</span>
            <ul className="list-disc pl-3.5 space-y-0.5 font-sans">
              {activeStrat.pros.slice(0, 2).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-bold text-rose-400 block mb-0.5">✗ WEAKNESSES:</span>
            <ul className="list-disc pl-3.5 space-y-0.5 font-sans">
              {activeStrat.cons.slice(0, 2).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
