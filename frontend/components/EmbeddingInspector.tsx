"use client";

import React, { useState } from "react";
import { EmbeddedChunk } from "../lib/semantic-fallback";
import { Copy, Check, Download, FileJson, Info } from "lucide-react";

interface EmbeddingInspectorProps {
  chunk: EmbeddedChunk | null;
  strategy: string;
  onNavigate: (id: number) => void;
  chunksCount: number;
}

export default function EmbeddingInspector({
  chunk,
  strategy,
  onNavigate,
  chunksCount,
}: EmbeddingInspectorProps) {
  const [copied, setCopied] = useState(false);

  if (!chunk) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs glass-panel border border-border bg-card/25 rounded-xl">
        Click on any point in the scatter plot to inspect its semantic embedding vector.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(chunk.embedding));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          id: chunk.id,
          model: chunk.embeddingModel || "all-MiniLM-L6-v2",
          dimensions: chunk.embedding.length,
          coordinates2D: chunk.projected2D,
          vector: chunk.embedding,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chunk_${chunk.id}_embedding.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const hasPrev = parseInt(chunk.id) > 0;
  const hasNext = parseInt(chunk.id) < chunksCount - 1;

  // Format vector preview (show first 12 dimensions)
  const vectorPreview = chunk.embedding.slice(0, 12).map((val) => val.toFixed(4)).join(", ");
  const hiddenCount = chunk.embedding.length - 12;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <FileJson className="h-4 w-4 text-violet-400" />
          <span>Vector Inspector (Chunk #{chunk.id})</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {chunk.embedding.length} dims
        </span>
      </div>

      {/* Details list */}
      <div className="space-y-4 text-xs font-mono">
        {/* Model info */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-secondary/45 p-2 rounded border border-border/80">
            <span className="text-muted-foreground block text-[8px] font-sans">EMBEDDING MODEL</span>
            <span className="font-bold truncate block">{chunk.embeddingModel || "all-MiniLM-L6-v2"}</span>
          </div>
          <div className="bg-secondary/45 p-2 rounded border border-border/80">
            <span className="text-muted-foreground block text-[8px] font-sans">TOPIC GROUP</span>
            <span className="font-bold text-primary truncate block">{chunk.semanticTopic || "Unclassified"}</span>
          </div>
          <div className="bg-secondary/45 p-2 rounded border border-border/80 col-span-2">
            <span className="text-muted-foreground block text-[8px] font-sans">2D COMPRESSED COORDINATES</span>
            <span className="font-bold block">
              x: {chunk.projected2D.x.toFixed(5)}, y: {chunk.projected2D.y.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Vector Values array preview */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-semibold text-muted-foreground uppercase font-sans">
            <span>Float Array Vector</span>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 hover:text-foreground cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy Array"}</span>
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center space-x-1 hover:text-foreground cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#020204] border border-border/80 rounded-lg text-[10px] text-muted-foreground break-all leading-relaxed whitespace-pre-wrap select-all">
            [{vectorPreview}, <span className="text-primary italic">... +{hiddenCount} more dimensions</span>]
          </div>
        </div>
      </div>
    </div>
  );
}
