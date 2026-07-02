"use client";

import React, { useEffect } from "react";
import { ChunkParams } from "../lib/fallback-engine";
import { Info } from "lucide-react";

interface ParameterPanelProps {
  strategy: string;
  params: ChunkParams;
  onChange: (newParams: ChunkParams) => void;
  isLearningMode: boolean;
}

export default function ParameterPanel({ strategy, params, onChange, isLearningMode }: ParameterPanelProps) {
  // Enforce boundary values on change
  const updateParam = (key: keyof ChunkParams, value: any) => {
    const updated = { ...params, [key]: value };
    
    // Safety check: chunk_overlap cannot be >= chunk_size
    if (key === "chunk_size" && updated.chunk_overlap !== undefined && value <= updated.chunk_overlap) {
      updated.chunk_overlap = Math.max(0, value - 10);
    }
    if (key === "chunk_overlap" && updated.chunk_size !== undefined && value >= updated.chunk_size) {
      updated.chunk_overlap = Math.max(0, updated.chunk_size - 10);
    }
    
    // Safety check for sliding window: stride cannot exceed window_size
    if (key === "window_size" && updated.stride !== undefined && value <= updated.stride) {
      updated.stride = Math.max(1, Math.round(value / 2));
    }
    if (key === "stride" && updated.window_size !== undefined && value >= updated.window_size) {
      updated.stride = Math.max(1, updated.window_size - 1);
    }

    onChange(updated);
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card space-y-5">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-sm">Configure Parameters</h3>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono uppercase">
          {strategy} settings
        </span>
      </div>

      {/* --- FIXED & RECURSIVE CONTROLS --- */}
      {(strategy === "fixed" || strategy === "recursive") && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center">
                Chunk Size (Chars)
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
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>Controls the maximum character length of a single chunk. Larger sizes preserve full context but increase noise and costs.</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Chunk Overlap (Chars)</span>
              <span className="font-mono font-bold text-primary">{params.chunk_overlap ?? 100}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={params.chunk_overlap ?? 100}
              onChange={(e) => updateParam("chunk_overlap", parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>Specifies characters shared between consecutive chunks. Essential to prevent dividing statements in half. Recommended ~10-20% of Chunk Size.</span>
              </p>
            )}
          </div>

          {strategy === "recursive" && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium block">Separators (Priority Order)</span>
              <div className="flex flex-wrap gap-1.5">
                {["Paragraph (\\n\\n)", "Newline (\\n)", "Space ( )", "Character (\"\")"].map((sepLabel, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-secondary border border-border/80 px-2 py-1 rounded font-mono font-medium text-muted-foreground"
                  >
                    {sepLabel}
                  </span>
                ))}
              </div>
              {isLearningMode && (
                <p className="text-[10px] text-muted-foreground leading-normal mt-1.5">
                  The splitter tries separators sequentially, splitting paragraphs first, then sentences, words, and characters only if the chunk size limit is violated.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SENTENCE CONTROLS --- */}
      {strategy === "sentence" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Sentences Per Chunk</span>
              <span className="font-mono font-bold text-primary">{params.sentences_per_chunk ?? 3}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={params.sentences_per_chunk ?? 3}
              onChange={(e) => updateParam("sentences_per_chunk", parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>Groups a fixed count of sentences together. Ensures sentences remain complete and are never split mid-thought.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- PARAGRAPH CONTROLS --- */}
      {strategy === "paragraph" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Paragraphs Per Chunk</span>
              <span className="font-mono font-bold text-primary">{params.paragraphs_per_chunk ?? 1}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={params.paragraphs_per_chunk ?? 1}
              onChange={(e) => updateParam("paragraphs_per_chunk", parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>Defines paragraphs grouped per chunk. Paragraphs are split by double newlines, representing semantic unit context shifts.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- SLIDING WINDOW CONTROLS --- */}
      {strategy === "sliding" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Window Size (Words)</span>
              <span className="font-mono font-bold text-primary">{params.window_size ?? 100}</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={params.window_size ?? 100}
              onChange={(e) => updateParam("window_size", parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>Maximum word length of the sliding window. Similar to fixed size but word-bound.</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Stride (Words Shift)</span>
              <span className="font-mono font-bold text-primary">{params.stride ?? 50}</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={params.stride ?? 50}
              onChange={(e) => updateParam("stride", parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {isLearningMode && (
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1 mt-1">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
                <span>The step count the window shifts by. Stride = Window Size - Overlap Words. If Stride = 50 and Window = 100, the overlap is 50 words (50%).</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
