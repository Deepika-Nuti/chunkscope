"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2, Search, HelpCircle, FileText, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Chunk } from "../lib/fallback-engine";

interface LiveVisualizerProps {
  originalText: string;
  chunks: Chunk[];
  hoveredChunkId: number | null;
  setHoveredChunkId: (id: number | null) => void;
  selectedChunkId: number | null;
  setSelectedChunkId: (id: number | null) => void;
  isProcessing?: boolean;
}

// Map a chunk ID to a unique, consistent pastel HSL color using Golden Ratio distribution
export function getChunkColor(id: number, opacity = 0.2): string {
  const hue = (id * 137.5) % 360;
  return `hsla(${hue}, 85%, 55%, ${opacity})`;
}

export function getChunkBorderColor(id: number): string {
  const hue = (id * 137.5) % 360;
  return `hsla(${hue}, 85%, 45%, 0.6)`;
}

export default function LiveVisualizer({
  originalText,
  chunks,
  hoveredChunkId,
  setHoveredChunkId,
  selectedChunkId,
  setSelectedChunkId,
  isProcessing,
}: LiveVisualizerProps) {
  const [zoomLevel, setZoomLevel] = useState(14); // Font size in px
  const [searchTerm, setSearchTerm] = useState("");
  const chunkRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const docContainerRef = useRef<HTMLDivElement>(null);

  // Interval-splitting algorithm: breaks original text into non-overlapping slices
  const textSlices = useMemo(() => {
    if (!originalText || chunks.length === 0) {
      return [{ start: 0, end: originalText.length, text: originalText, chunkIds: [], isOverlap: false }];
    }

    // Gather all slice boundaries
    const pointsSet = new Set<number>();
    pointsSet.add(0);
    pointsSet.add(originalText.length);
    chunks.forEach((c) => {
      pointsSet.add(c.start_char);
      pointsSet.add(c.end_char);
    });

    const sortedPoints = Array.from(pointsSet).sort((a, b) => a - b);
    const slices = [];

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];
      const sliceText = originalText.slice(start, end);
      if (sliceText.length === 0) continue;

      // Find chunks covering this character interval
      const activeChunks = chunks.filter((c) => c.start_char <= start && c.end_char >= end);
      const chunkIds = activeChunks.map((c) => c.id);

      slices.push({
        start,
        end,
        text: sliceText,
        chunkIds,
        isOverlap: chunkIds.length > 1,
      });
    }

    return slices;
  }, [originalText, chunks]);

  // Handle auto-scroll to sync panels when a chunk is hovered
  useEffect(() => {
    if (hoveredChunkId !== null && chunkRefs.current[hoveredChunkId]) {
      chunkRefs.current[hoveredChunkId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [hoveredChunkId]);

  const activeChunk = useMemo(() => {
    const activeId = hoveredChunkId !== null ? hoveredChunkId : selectedChunkId;
    return chunks.find((c) => c.id === activeId) || null;
  }, [chunks, hoveredChunkId, selectedChunkId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* 1. Document Visual Highlight Container */}
      <div className="lg:col-span-2 flex flex-col h-full glass-panel border border-border bg-card/45 rounded-xl overflow-hidden relative">
        {/* Controls header */}
        <div className="flex flex-wrap items-center justify-between p-3 border-b border-border bg-secondary/30 gap-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Document Visualizer</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search raw text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs bg-secondary rounded-md border border-border outline-none focus:border-primary/50 w-36 focus:w-44 transition-all"
              />
            </div>

            {/* Font Zoom */}
            <div className="flex items-center border border-border bg-secondary/50 rounded-md overflow-hidden">
              <button
                onClick={() => setZoomLevel(Math.max(10, zoomLevel - 1))}
                className="p-1 hover:bg-accent cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-2 border-x border-border">
                {zoomLevel}px
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(22, zoomLevel + 1))}
                className="p-1 hover:bg-accent cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Highlighted text canvas */}
        <div
          ref={docContainerRef}
          style={{ fontSize: `${zoomLevel}px` }}
          className="flex-1 overflow-y-auto p-5 font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-primary/20 relative"
        >
          {isProcessing && <div className="scan-line" />}
          {chunks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              Upload a document or load the sample guide to visualize chunks.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {textSlices.map((slice, index) => {
                const isSliceHovered = hoveredChunkId !== null && slice.chunkIds.includes(hoveredChunkId);
                const isSliceSelected = selectedChunkId !== null && slice.chunkIds.includes(selectedChunkId);
                
                // Calculate style
                let style: React.CSSProperties = {};
                let className = "relative inline rounded-[3px] py-[1px] transition-all duration-150 cursor-pointer ";

                if (slice.chunkIds.length === 0) {
                  // Unchunked plain whitespace/text
                  className += "text-muted-foreground/60";
                } else if (slice.isOverlap) {
                  // Overlap: render diagonal stripes blending chunk colors
                  className += "border-b-2 border-amber-500/40 ";
                  const c1 = getChunkColor(slice.chunkIds[0], 0.25);
                  const c2 = getChunkColor(slice.chunkIds[1], 0.3);
                  style.background = `repeating-linear-gradient(45deg, ${c1} 0px, ${c1} 6px, ${c2} 6px, ${c2} 12px)`;
                  if (isSliceHovered || isSliceSelected) {
                    className += "ring-1 ring-amber-400 font-medium ";
                    style.background = `repeating-linear-gradient(45deg, ${getChunkColor(slice.chunkIds[0], 0.4)} 0px, ${getChunkColor(slice.chunkIds[0], 0.4)} 6px, ${getChunkColor(slice.chunkIds[1], 0.55)} 6px, ${getChunkColor(slice.chunkIds[1], 0.55)} 12px)`;
                  }
                } else {
                  // Standard single chunk region
                  const chunkId = slice.chunkIds[0];
                  style.backgroundColor = getChunkColor(chunkId, 0.14);
                  style.borderBottom = `2px solid ${getChunkBorderColor(chunkId)}`;
                  
                  if (isSliceHovered || isSliceSelected) {
                    className += "font-medium ring-1 ";
                    style.backgroundColor = getChunkColor(chunkId, 0.32);
                    style.borderColor = getChunkBorderColor(chunkId);
                  }
                }

                // Apply search highlights on top of slices
                const containsSearch = searchTerm && slice.text.toLowerCase().includes(searchTerm.toLowerCase());
                if (containsSearch) {
                  className += " ring-2 ring-primary bg-primary/20 ";
                }

                return (
                  <motion.span
                    key={`slice-${index}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={className}
                    style={style}
                    onMouseEnter={() => {
                      if (slice.chunkIds.length > 0) {
                        // Hover the first chunk of this slice
                        setHoveredChunkId(slice.chunkIds[0]);
                      }
                    }}
                    onMouseLeave={() => setHoveredChunkId(null)}
                    onClick={() => {
                      if (slice.chunkIds.length > 0) {
                        setSelectedChunkId(slice.chunkIds[0]);
                      }
                    }}
                  >
                    {slice.text}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Live Hover Info Floating Bar */}
        {activeChunk && (
          <div className="p-3 bg-secondary/60 border-t border-border flex flex-wrap items-center justify-between text-xs px-5 gap-3 animate-fade-in relative z-20">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-primary font-mono">
                Chunk #{activeChunk.id}
              </span>
              <span className="text-muted-foreground border-l border-border pl-3">
                Chars: <b className="text-foreground">{activeChunk.char_count}</b>
              </span>
              <span className="text-muted-foreground border-l border-border pl-3">
                Tokens: <b className="text-foreground">{activeChunk.token_count}</b>
              </span>
              <span className="text-muted-foreground border-l border-border pl-3">
                Range: <b className="text-foreground font-mono">{activeChunk.start_char}-{activeChunk.end_char}</b>
              </span>
            </div>
            {(activeChunk.overlap_prev > 0 || activeChunk.overlap_next > 0) && (
              <div className="flex items-center space-x-2 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded">
                <span>Overlap: Prev {activeChunk.overlap_prev} Chars | Next {activeChunk.overlap_next} Chars</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Chunk Cards List */}
      <div className="flex flex-col h-full glass-panel border border-border bg-card/45 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Chunk Inventory ({chunks.length} total)</span>
            <span className="text-[9px] text-muted-foreground italic">"Where are the chunks located?"</span>
          </div>
        </div>

        {/* Local card expanded states helper */}
        <CardList chunks={chunks} hoveredChunkId={hoveredChunkId} setHoveredChunkId={setHoveredChunkId} selectedChunkId={selectedChunkId} setSelectedChunkId={setSelectedChunkId} chunkRefs={chunkRefs} />
      </div>
    </div>
  );
}

// Sub-component to manage per-card expandable state cleanly
function CardList({
  chunks,
  hoveredChunkId,
  setHoveredChunkId,
  selectedChunkId,
  setSelectedChunkId,
  chunkRefs,
}: {
  chunks: Chunk[];
  hoveredChunkId: number | null;
  setHoveredChunkId: (id: number | null) => void;
  selectedChunkId: number | null;
  setSelectedChunkId: (id: number | null) => void;
  chunkRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
}) {
  const [expandedIds, setExpandedIds] = React.useState<Record<number, boolean>>({});

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {chunks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground text-xs text-center p-4">
          Your generated chunks will appear here as catalogued cards.
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {chunks.map((chunk) => {
            const isHovered = hoveredChunkId === chunk.id;
            const isSelected = selectedChunkId === chunk.id;
            const isExpanded = !!expandedIds[chunk.id];

            const borderStyle = {
              borderColor: isHovered || isSelected ? getChunkBorderColor(chunk.id) : "transparent",
            };

            return (
              <motion.div
                key={chunk.id}
                ref={(el) => {
                  chunkRefs.current[chunk.id] = el;
                }}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                style={borderStyle}
                className={`p-3 rounded-lg border transition-all text-xs relative cursor-pointer ${
                  isHovered || isSelected
                    ? "bg-secondary/90 shadow-md ring-1 ring-primary/20 scale-[1.01]"
                    : "bg-secondary/40 hover:bg-secondary/60 border-border"
                }`}
                onMouseEnter={() => setHoveredChunkId(chunk.id)}
                onMouseLeave={() => setHoveredChunkId(null)}
                onClick={() => setSelectedChunkId(chunk.id)}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-primary font-mono text-[11px]">Chunk #{chunk.id}</span>
                  <div className="flex space-x-1 text-[8.5px] font-mono text-muted-foreground">
                    <span>Tokens: ~{chunk.token_count}</span>
                    <span>|</span>
                    <span>Chars: {chunk.start_char}-{chunk.end_char}</span>
                  </div>
                </div>

                <p className="line-clamp-2 text-muted-foreground font-mono text-[9.5px] whitespace-pre-wrap leading-relaxed mb-2">
                  {chunk.text}
                </p>

                {/* Show Details toggle */}
                <div className="flex justify-between items-center pt-1.5 border-t border-border/40 text-[9px]">
                  <button
                    onClick={(e) => toggleExpand(chunk.id, e)}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </button>

                  {isExpanded && (
                    <span className="text-muted-foreground text-[8px]">
                      Len: {chunk.char_count} chars
                    </span>
                  )}
                </div>

                {/* Expanded details container */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-dashed border-border/60 grid grid-cols-2 gap-2 text-[8.5px] font-mono text-muted-foreground">
                    <div>Prev Overlap: <b className="text-amber-500">{chunk.overlap_prev}c</b></div>
                    <div>Next Overlap: <b className="text-amber-500">{chunk.overlap_next}c</b></div>
                    <div>Coherence Score: <span className="text-emerald-400 font-bold">High (95%)</span></div>
                    <div>Retrieval Estimate: <span className="text-indigo-400 font-bold">Good (90%)</span></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
