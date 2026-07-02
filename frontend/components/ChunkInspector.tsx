"use client";

import React, { useEffect, useRef } from "react";
import { X, Copy, Check, ChevronLeft, ChevronRight, Download, Eye, FileJson, Info } from "lucide-react";
import { Chunk } from "../lib/fallback-engine";
import ChunkExplanationPanel from "./ChunkExplanationPanel";

interface ChunkInspectorProps {
  chunk: Chunk | null;
  strategy: string;
  chunksCount: number;
  onClose: () => void;
  onNavigate: (id: number) => void;
  chunkSizeSetting?: number;
  overlapSetting?: number;
}

export default function ChunkInspector({
  chunk,
  strategy,
  chunksCount,
  onClose,
  onNavigate,
  chunkSizeSetting,
  overlapSetting,
}: ChunkInspectorProps) {
  const [copied, setCopied] = React.useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!chunk) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(chunk.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          id: chunk.id,
          strategy: strategy,
          character_range: `${chunk.start_char}-${chunk.end_char}`,
          word_count: chunk.word_count,
          token_count: chunk.token_count,
          overlap_prev: chunk.overlap_prev,
          overlap_next: chunk.overlap_next,
          text: chunk.text,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chunk_${chunk.id}_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Navigate through indices safely
  const hasPrev = chunk.id > 0;
  const hasNext = chunk.id < chunksCount - 1;

  return (
    <>
      {/* Background Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Slide-out Drawer Panel */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-slide-in text-xs"
      >
        {/* 1. Header Navigation Bar */}
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-sm text-primary font-mono">
              Chunk Inspector #{chunk.id}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase border-l border-border pl-3">
              {strategy}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Prev/Next arrows */}
            <button
              onClick={() => hasPrev && onNavigate(chunk.id - 1)}
              disabled={!hasPrev}
              className="p-1.5 rounded-md hover:bg-secondary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Chunk"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-mono font-semibold text-muted-foreground">
              {chunk.id + 1} / {chunksCount}
            </span>
            <button
              onClick={() => hasNext && onNavigate(chunk.id + 1)}
              disabled={!hasNext}
              className="p-1.5 rounded-md hover:bg-secondary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Chunk"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground border border-border ml-2"
              title="Close Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
            <div className="bg-secondary/40 border border-border/80 p-2.5 rounded-lg">
              <span className="text-muted-foreground block text-[9px] uppercase font-sans">Character Range</span>
              <span className="font-bold text-foreground">{chunk.start_char} - {chunk.end_char}</span>
            </div>
            <div className="bg-secondary/40 border border-border/80 p-2.5 rounded-lg">
              <span className="text-muted-foreground block text-[9px] uppercase font-sans">Estimated Tokens</span>
              <span className="font-bold text-foreground">~{chunk.token_count}</span>
            </div>
            <div className="bg-secondary/40 border border-border/80 p-2.5 rounded-lg">
              <span className="text-muted-foreground block text-[9px] uppercase font-sans">Overlap Amount</span>
              <span className="font-bold text-amber-500">
                {chunk.overlap_prev > 0 ? `Prev ${chunk.overlap_prev}c` : ""}
                {chunk.overlap_prev > 0 && chunk.overlap_next > 0 ? " | " : ""}
                {chunk.overlap_next > 0 ? `Next ${chunk.overlap_next}c` : ""}
                {chunk.overlap_prev === 0 && chunk.overlap_next === 0 ? "0 characters" : ""}
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/80 p-2.5 rounded-lg">
              <span className="text-muted-foreground block text-[9px] uppercase font-sans">Estimated Page</span>
              <span className="font-bold text-foreground">Page {Math.max(1, Math.ceil(chunk.start_char / 2000))}</span>
            </div>
          </div>

          {/* Text Preview syntax highlighting simulation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground uppercase">
              <span>Text Passage Snippet</span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 hover:text-foreground cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="flex items-center space-x-1 hover:text-foreground cursor-pointer"
                >
                  <FileJson className="h-3 w-3" />
                  <span>JSON Metadata</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-secondary/70 border border-border rounded-xl font-mono text-[10.5px] leading-relaxed whitespace-pre-wrap select-all max-h-60 overflow-y-auto scrollbar-thin">
              {chunk.text}
            </div>
          </div>

          {/* Educational Splitting explanation */}
          <div className="border-t border-border pt-5">
            <h4 className="font-bold text-xs text-foreground mb-3 flex items-center">
              <Info className="h-4 w-4 mr-1 text-primary animate-pulse" />
              Educational Split Assessment
            </h4>
            <ChunkExplanationPanel
              chunk={chunk}
              strategy={strategy}
              chunkSizeSetting={chunkSizeSetting}
              overlapSetting={overlapSetting}
            />
          </div>
        </div>

        {/* 3. Bottom Close Bar */}
        <div className="p-4 border-t border-border bg-secondary/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-xs rounded-lg bg-primary text-primary-foreground border border-primary/20 cursor-pointer transition-all hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
