"use client";

import React, { useState } from "react";
import { ChunkParams } from "../lib/fallback-engine";
import { HelpCircle, Info, X } from "lucide-react";

interface ParameterPanelProps {
  strategy: string;
  params: ChunkParams;
  onChange: (newParams: ChunkParams) => void;
  isLearningMode: boolean;
}

interface TooltipDetail {
  title: string;
  beginner: string;
  advanced: string;
  example: string;
}

const TOOLTIPS: Record<string, TooltipDetail> = {
  chunk_size: {
    title: "Chunk Size (Characters)",
    beginner: "Determines how much text goes into one single piece. Like cutting a long cake into slices.",
    advanced: "Directly bounds the token capacity feeding embedding encoders (e.g. OpenAI text-embedding-3). Large sizes risk diluting retrieval vector precision.",
    example: "500 characters is roughly 1-2 paragraphs of standard text.",
  },
  chunk_overlap: {
    title: "Chunk Overlap (Characters)",
    beginner: "Copies text at the boundaries. Prevents splitting a single sentence in half between two chunks.",
    advanced: "Creates context redundancy across chunks. Prevents slicing boundary phrases to preserve semantic continuity.",
    example: "100 characters is roughly 15-20 words copied to the next chunk.",
  },
  sentences_per_chunk: {
    title: "Sentences Per Chunk",
    beginner: "Specifies a fixed count of sentences to keep together.",
    advanced: "Sentence splits keep syntactic clauses complete. Minimizes structural noise in vector representations.",
    example: "3 sentences is ideal for Q&A systems covering compact facts.",
  },
  paragraphs_per_chunk: {
    title: "Paragraphs Per Chunk",
    beginner: "Groups paragraphs split by double newlines into one block.",
    advanced: "Groups content by thematic layout breaks. Maintains maximum cohesion for document summaries.",
    example: "1 paragraph matches structured documentation briefs.",
  },
  window_size: {
    title: "Window Size (Words)",
    beginner: "Defines the word capacity in sliding windows.",
    advanced: "Ensures window matches transformer context tokens.",
    example: "100 words is roughly 130 tokens.",
  },
  stride: {
    title: "Stride (Shift Step)",
    beginner: "Steps the window moves forward. Stride of 50 means 50% overlap.",
    advanced: "Calculates stride offsets. Stride = Window - Overlap.",
    example: "Stride of 50 words on a 100-word window creates a 50-word overlap buffer.",
  },
};

export default function ParameterPanel({ strategy, params, onChange, isLearningMode }: ParameterPanelProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const updateParam = (key: keyof ChunkParams, value: any) => {
    const updated = { ...params, [key]: value };
    
    // Safety check
    if (key === "chunk_size" && updated.chunk_overlap !== undefined && value <= updated.chunk_overlap) {
      updated.chunk_overlap = Math.max(0, value - 10);
    }
    if (key === "chunk_overlap" && updated.chunk_size !== undefined && value >= updated.chunk_size) {
      updated.chunk_overlap = Math.max(0, updated.chunk_size - 10);
    }
    if (key === "window_size" && updated.stride !== undefined && value <= updated.stride) {
      updated.stride = Math.max(1, Math.round(value / 2));
    }
    if (key === "stride" && updated.window_size !== undefined && value >= updated.window_size) {
      updated.stride = Math.max(1, updated.window_size - 1);
    }

    onChange(updated);
  };

  const renderTooltipOverlay = (key: string) => {
    const detail = TOOLTIPS[key];
    if (!detail) return null;

    return (
      <div className="absolute inset-0 bg-[#070709]/95 border border-primary/20 p-4 rounded-xl flex flex-col justify-between text-[10px] leading-normal z-25 text-zinc-300 font-sans">
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
            <span className="font-extrabold text-[11px] text-foreground flex items-center">
              <HelpCircle className="h-3.5 w-3.5 mr-1 text-primary" />
              {detail.title}
            </span>
            <button onClick={() => setActiveTooltip(null)} className="p-0.5 hover:bg-secondary rounded">
              <X className="h-3 w-3" />
            </button>
          </div>

          <div>
            <span className="font-bold text-primary block text-[8px] tracking-wider uppercase">Beginner Explanation</span>
            <p className="pt-0.5 text-zinc-400">{detail.beginner}</p>
          </div>

          <div>
            <span className="font-bold text-indigo-400 block text-[8px] tracking-wider uppercase">Advanced Explanation</span>
            <p className="pt-0.5 text-zinc-400">{detail.advanced}</p>
          </div>

          <div>
            <span className="font-bold text-amber-400 block text-[8px] tracking-wider uppercase">Visual Example</span>
            <p className="pt-0.5 text-zinc-500 font-mono text-[9px]">{detail.example}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card space-y-5 relative">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-xs">Configure Parameters</h3>
        <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono uppercase">
          {strategy} settings
        </span>
      </div>

      {/* --- FIXED & RECURSIVE CONTROLS --- */}
      {(strategy === "fixed" || strategy === "recursive") && (
        <div className="space-y-4">
          
          {/* Chunk Size */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Chunk Size (Chars)</span>
                <button onClick={() => setActiveTooltip("chunk_size")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.chunk_size ?? 500}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={params.chunk_size ?? 500}
              onChange={(e) => updateParam("chunk_size", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            
            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>100</span>
              <span>500</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 400–1000</span>
              <span>1500</span>
              <span>2000</span>
            </div>

            {activeTooltip === "chunk_size" && renderTooltipOverlay("chunk_size")}
          </div>

          {/* Chunk Overlap */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Chunk Overlap (Chars)</span>
                <button onClick={() => setActiveTooltip("chunk_overlap")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.chunk_overlap ?? 100}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={params.chunk_overlap ?? 100}
              onChange={(e) => updateParam("chunk_overlap", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>0</span>
              <span>100</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 50–150</span>
              <span>300</span>
              <span>500</span>
            </div>

            {activeTooltip === "chunk_overlap" && renderTooltipOverlay("chunk_overlap")}
          </div>

          {strategy === "recursive" && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Separators (Priority Order)</span>
              <div className="flex flex-wrap gap-1">
                {["Paragraph (\\n\\n)", "Newline (\\n)", "Space ( )", "Character (\"\")"].map((sepLabel, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-secondary border border-border/80 px-2 py-0.5 rounded font-mono font-semibold text-muted-foreground"
                  >
                    {sepLabel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SENTENCE CONTROLS --- */}
      {strategy === "sentence" && (
        <div className="space-y-4">
          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Sentences Per Chunk</span>
                <button onClick={() => setActiveTooltip("sentences_per_chunk")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.sentences_per_chunk ?? 3}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={params.sentences_per_chunk ?? 3}
              onChange={(e) => updateParam("sentences_per_chunk", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>1</span>
              <span>4</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 2–5</span>
              <span>10</span>
              <span>15</span>
            </div>

            {activeTooltip === "sentences_per_chunk" && renderTooltipOverlay("sentences_per_chunk")}
          </div>
        </div>
      )}

      {/* --- PARAGRAPH CONTROLS --- */}
      {strategy === "paragraph" && (
        <div className="space-y-4">
          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Paragraphs Per Chunk</span>
                <button onClick={() => setActiveTooltip("paragraphs_per_chunk")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.paragraphs_per_chunk ?? 1}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={params.paragraphs_per_chunk ?? 1}
              onChange={(e) => updateParam("paragraphs_per_chunk", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>1</span>
              <span>3</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 1–2</span>
              <span>6</span>
              <span>10</span>
            </div>

            {activeTooltip === "paragraphs_per_chunk" && renderTooltipOverlay("paragraphs_per_chunk")}
          </div>
        </div>
      )}

      {/* --- SLIDING WINDOW CONTROLS --- */}
      {strategy === "sliding" && (
        <div className="space-y-4">
          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Window Size (Words)</span>
                <button onClick={() => setActiveTooltip("window_size")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.window_size ?? 100}</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={params.window_size ?? 100}
              onChange={(e) => updateParam("window_size", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>10</span>
              <span>80</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 80–150</span>
              <span>200</span>
              <span>300</span>
            </div>

            {activeTooltip === "window_size" && renderTooltipOverlay("window_size")}
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium flex items-center space-x-1">
                <span>Stride (Words Shift)</span>
                <button onClick={() => setActiveTooltip("stride")} className="p-0.5 hover:text-primary transition-all">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-pointer" />
                </button>
              </span>
              <span className="font-mono font-bold text-primary">{params.stride ?? 50}</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={params.stride ?? 50}
              onChange={(e) => updateParam("stride", parseInt(e.target.value))}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            {/* Tick Scale & Recommended Value labels */}
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-mono px-0.5">
              <span>5</span>
              <span>40</span>
              <span className="text-primary font-semibold bg-primary/5 border border-primary/20 px-1 py-0.2 rounded">Rec: 40–80</span>
              <span>100</span>
              <span>150</span>
            </div>

            {activeTooltip === "stride" && renderTooltipOverlay("stride")}
          </div>
        </div>
      )}
    </div>
  );
}
