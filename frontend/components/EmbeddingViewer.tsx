"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { EmbeddedChunk, SemanticEdge } from "../lib/semantic-fallback";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";
import { ZoomIn, ZoomOut, Move, Eye, Network, HelpCircle } from "lucide-react";

interface EmbeddingViewerProps {
  chunks: EmbeddedChunk[];
  edges: SemanticEdge[];
  projectionMethod: string;
  setProjectionMethod: (method: string) => void;
  selectedChunkId: number | null;
  setSelectedChunkId: (id: number | null) => void;
  hoveredChunkId: number | null;
  setHoveredChunkId: (id: number | null) => void;
  isLearningMode: boolean;
}

export default function EmbeddingViewer({
  chunks,
  edges,
  projectionMethod,
  setProjectionMethod,
  selectedChunkId,
  setSelectedChunkId,
  hoveredChunkId,
  setHoveredChunkId,
  isLearningMode,
}: EmbeddingViewerProps) {
  const [zoom, setZoom] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showEdges, setShowEdges] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Constants
  const width = 500;
  const height = 360;

  // Reset zoom & pan when document changes
  useEffect(() => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  }, [chunks.length]);

  // Translate scaled coords [-1, 1] to pixel coords [padding, width-padding]
  const coordinatesMap = useMemo(() => {
    const padding = 40;
    return chunks.map((c) => {
      const proj = c.projected2D || { x: 0, y: 0 };
      
      // Center position
      const cx = padding + ((proj.x + 1.0) / 2.0) * (width - 2 * padding);
      const cy = padding + ((1.0 - proj.y) / 2.0) * (height - 2 * padding); // Flip Y

      return {
        id: c.id,
        cx,
        cy,
        cluster: c.cluster || 0,
        topic: c.semanticTopic || "Unclassified",
        text: c.text,
      };
    });
  }, [chunks]);

  // Map coordinates by ID for fast lookup
  const coordsById = useMemo(() => {
    const map: Record<string, { cx: number; cy: number }> = {};
    coordinatesMap.forEach((c) => {
      map[c.id] = { cx: c.cx, cy: c.cy };
    });
    return map;
  }, [coordinatesMap]);

  // Handle Drag / Panning mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zooming via scrollwheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.08;
    const newZoom = e.deltaY < 0 ? Math.min(4.0, zoom + zoomFactor) : Math.max(0.6, zoom - zoomFactor);
    setZoom(Math.round(newZoom * 100) / 100);
  };

  const handleReset = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap justify-between items-center pb-2 border-b border-border gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <Network className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-semibold">2D Semantic Embedding Space</span>
        </div>

        <div className="flex items-center space-x-3 text-[10px]">
          {/* Edge Toggle */}
          <button
            onClick={() => setShowEdges(!showEdges)}
            className={`p-1.5 border border-border rounded-md cursor-pointer transition-all flex items-center space-x-1 ${
              showEdges ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground"
            }`}
            title="Toggle Neighbor Index Edges (HNSW graph)"
          >
            <Network className="h-3 w-3" />
            <span>{showEdges ? "Hide Edges" : "Show Edges"}</span>
          </button>

          {/* Projections dropdown */}
          <div className="flex items-center space-x-1.5 border border-border bg-secondary/35 p-0.5 rounded-md">
            {["PCA", "t-SNE", "UMAP"].map((method) => {
              const isActive = projectionMethod.toLowerCase() === method.toLowerCase();
              return (
                <button
                  key={method}
                  onClick={() => setProjectionMethod(method.toLowerCase())}
                  className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                    isActive ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>

          {/* Reset Zoom */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-secondary border border-border hover:bg-secondary/70 rounded-md cursor-pointer font-bold uppercase"
          >
            Reset
          </button>
        </div>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Each point represents a text chunk. Chunks sharing topics are colored similarly and cluster together. The lines represent the <b>nearest neighbor relationships</b>, which vector databases navigate during similarity queries (HNSW indexes).
          </span>
        </p>
      )}

      {/* SVG Canvas Map Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full relative h-[360px] bg-[#020204] border border-border/70 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        {/* Graph background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Viewport Scale Indicator */}
        <div className="absolute bottom-3 left-3 text-[8px] font-mono text-muted-foreground/50 flex items-center space-x-2">
          <Move className="h-3 w-3" />
          <span>Zoom: {zoom}x | Offset: {offset.x}px, {offset.y}px</span>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="relative z-10"
        >
          {/* Zoom/Pan Transform Group */}
          <g transform={`translate(${offset.x + (width / 2) * (1 - zoom)}, ${offset.y + (height / 2) * (1 - zoom)}) scale(${zoom})`}>
            
            {/* 1. Draw Connection Edges */}
            {showEdges &&
              edges.map((edge, idx) => {
                const s = coordsById[edge.source];
                const t = coordsById[edge.target];
                if (!s || !t) return null;
                
                const isEdgeHighlighted = hoveredChunkId !== null && (edge.source === String(hoveredChunkId) || edge.target === String(hoveredChunkId));
                
                return (
                  <line
                    key={`edge-${idx}`}
                    x1={s.cx}
                    y1={s.cy}
                    x2={t.cx}
                    y2={t.cy}
                    stroke={isEdgeHighlighted ? "rgba(99, 102, 241, 0.45)" : "rgba(255,255,255,0.04)"}
                    strokeWidth={isEdgeHighlighted ? 1.5 : 0.8}
                    className="transition-all duration-150"
                  />
                );
              })}

            {/* 2. Draw Data Points (Chunks) */}
            {coordinatesMap.map((pt) => {
              const isHovered = hoveredChunkId !== null && String(hoveredChunkId) === pt.id;
              const isSelected = selectedChunkId !== null && String(selectedChunkId) === pt.id;
              
              const radius = isSelected ? 8 : isHovered ? 7 : 5;
              const fillColor = getChunkColor(pt.cluster, isSelected || isHovered ? 0.9 : 0.65);
              const strokeColor = getChunkBorderColor(pt.cluster);

              return (
                <g key={pt.id}>
                  {/* Outer glow ring for selection */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={radius + 3}
                      fill="transparent"
                      stroke={strokeColor}
                      strokeWidth={1}
                      className="animate-pulse"
                    />
                  )}

                  {/* Core point */}
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isHovered ? 1.5 : 1}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredChunkId(parseInt(pt.id))}
                    onMouseLeave={() => setHoveredChunkId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChunkId(parseInt(pt.id));
                    }}
                  />

                  {/* ID labels if zoomed in significantly */}
                  {zoom > 1.8 && (
                    <text
                      x={pt.cx + 7}
                      y={pt.cy + 3}
                      fill="rgba(255,255,255,0.5)"
                      fontSize="6px"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      #{pt.id}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
