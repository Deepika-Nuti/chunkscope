"use client";

import React, { useMemo, useState } from "react";
import { EmbeddedChunk } from "../lib/semantic-fallback";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";
import { cosineSimilarity } from "../lib/semantic-fallback";
import { HelpCircle, Network, ArrowUpRight, Search } from "lucide-react";

interface SemanticNeighborhoodProps {
  selectedChunk: EmbeddedChunk | null;
  allChunks: EmbeddedChunk[];
  onSelectChunk: (id: number) => void;
  isLearningMode: boolean;
}

export default function SemanticNeighborhood({
  selectedChunk,
  allChunks,
  onSelectChunk,
  isLearningMode,
}: SemanticNeighborhoodProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // SVG dimensions
  const width = 460;
  const height = 280;

  // Resolve nearest neighbors in vector structures
  const neighborGraph = useMemo(() => {
    if (!selectedChunk || allChunks.length <= 1) return null;

    const list = allChunks
      .filter((c) => c.id !== selectedChunk.id)
      .map((c) => {
        const sim = cosineSimilarity(selectedChunk.embedding, c.embedding);
        const simPercent = Math.max(0, Math.min(100, Math.round(((sim + 1.0) / 2.0) * 100)));
        return {
          id: c.id,
          cluster: c.cluster || 0,
          text: c.text,
          cosine: sim,
          similarity: simPercent,
          chunk: c,
        };
      });

    // Sort descending and grab top 4 neighbors for orbit nodes
    const top4 = list.sort((a, b) => b.cosine - a.cosine).slice(0, 4);

    // Calculate node coordinates in circular orbit
    const center = { x: width / 2, y: height / 2 };
    const radius = 100;

    const nodes = top4.map((item, idx) => {
      const angle = (idx * 2 * Math.PI) / top4.length - Math.PI / 2; // Offset by 90deg to point first neighbor up
      const nx = center.x + radius * Math.cos(angle);
      const ny = center.y + radius * Math.sin(angle);
      
      return {
        ...item,
        x: nx,
        y: ny,
        ex: center.x + (radius - 16) * Math.cos(angle), // Edge label positions
        ey: center.y + (radius - 16) * Math.sin(angle),
      };
    });

    return {
      center,
      nodes,
    };
  }, [selectedChunk, allChunks]);

  if (!selectedChunk) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground text-xs glass-panel border border-border bg-card/25 rounded-xl">
        Select a chunk in the scatter plot to inspect its semantic neighborhood graph.
      </div>
    );
  }

  const activeHoveredNode = hoveredNodeId 
    ? allChunks.find((c) => c.id === hoveredNodeId) 
    : null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Network className="h-4 w-4 text-violet-400" />
          <span>Local Semantic Proximity Graph (Chunk #{selectedChunk.id})</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          Radius = 100px
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Click on any outer neighbor node (orbits) to navigate the center focus to that chunk, traversing the database space.
          </span>
        </p>
      )}

      {/* SVG Neighborhood Canvas */}
      {neighborGraph && (
        <div className="relative border border-border/60 bg-[#020204] rounded-xl flex items-center justify-center min-h-[280px]">
          <svg width={width} height={height} className="relative z-10">
            {/* Draw connection lines */}
            {neighborGraph.nodes.map((node) => (
              <g key={`edge-${node.id}`}>
                <line
                  x1={neighborGraph.center.x}
                  y1={neighborGraph.center.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={hoveredNodeId === node.id ? "rgba(99, 102, 241, 0.6)" : "rgba(255,255,255,0.08)"}
                  strokeWidth={hoveredNodeId === node.id ? 2 : 1}
                  strokeDasharray={hoveredNodeId === node.id ? "0" : "4,2"}
                  className="transition-all duration-150"
                />
                
                {/* Edge similarity label */}
                <rect
                  x={node.ex - 12}
                  y={node.ey - 6}
                  width="24"
                  height="12"
                  rx="3"
                  fill="rgba(10, 10, 12, 0.9)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                />
                <text
                  x={node.ex}
                  y={node.ey + 3}
                  fill={hoveredNodeId === node.id ? "#818cf8" : "rgba(255,255,255,0.5)"}
                  fontSize="7px"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {node.similarity}%
                </text>
              </g>
            ))}

            {/* Draw outer orbit nodes */}
            {neighborGraph.nodes.map((node) => {
              const cColor = getChunkColor(node.cluster, hoveredNodeId === node.id ? 0.8 : 0.45);
              const bColor = getChunkBorderColor(node.cluster);
              
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={() => onSelectChunk(parseInt(node.id))}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="15"
                    fill={cColor}
                    stroke={bColor}
                    strokeWidth="1.5"
                    className="transition-all duration-150 hover:scale-110"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#ffffff"
                    fontSize="9px"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    #{node.id}
                  </text>
                </g>
              );
            })}

            {/* Draw center focus node */}
            <g className="cursor-default">
              <circle
                cx={neighborGraph.center.x}
                cy={neighborGraph.center.y}
                r="20"
                fill={getChunkColor(selectedChunk.cluster || 0, 0.9)}
                stroke={getChunkBorderColor(selectedChunk.cluster || 0)}
                strokeWidth="2.5"
                className="animate-pulse"
              />
              <text
                x={neighborGraph.center.x}
                y={neighborGraph.center.y + 4}
                fill="#000000"
                fontSize="10px"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="extrabold"
              >
                #{selectedChunk.id}
              </text>
            </g>
          </svg>

          {/* Hover metadata text detail snippet */}
          {activeHoveredNode && (
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-popover/90 text-popover-foreground border border-border rounded-lg text-[10px] leading-normal font-sans text-muted-foreground flex justify-between items-center max-h-12 overflow-hidden animate-fade-in pointer-events-none">
              <span className="truncate flex-1">
                <b className="text-primary font-mono mr-1">Chunk #{activeHoveredNode.id}:</b>
                "{activeHoveredNode.text.slice(0, 120)}..."
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
