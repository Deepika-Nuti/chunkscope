"use client";

import React, { useMemo } from "react";
import { Chunk } from "../lib/fallback-engine";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";
import { Info, HelpCircle } from "lucide-react";

interface ChunkTimelineProps {
  chunks: Chunk[];
  totalLength: number;
  hoveredChunkId: number | null;
  setHoveredChunkId: (id: number | null) => void;
  selectedChunkId: number | null;
  setSelectedChunkId: (id: number | null) => void;
  isLearningMode: boolean;
}

export default function ChunkTimeline({
  chunks,
  totalLength,
  hoveredChunkId,
  setHoveredChunkId,
  selectedChunkId,
  setSelectedChunkId,
  isLearningMode,
}: ChunkTimelineProps) {
  // Stagger chunks across rows so overlapping blocks do not collide
  const timelineTracks = useMemo(() => {
    if (chunks.length === 0 || totalLength === 0) return [];

    const tracks: Chunk[][] = [];
    const trackEnds: number[] = [];

    chunks.forEach((chunk) => {
      let placed = false;
      
      // Attempt to place in existing track where start_char is after track's last end_char
      for (let t = 0; t < tracks.length; t++) {
        // Add a small 10 character safety padding to keep spacing clear
        if (chunk.start_char >= trackEnds[t] + 5) {
          tracks[t].push(chunk);
          trackEnds[t] = chunk.end_char;
          placed = true;
          break;
        }
      }

      if (!placed) {
        tracks.push([chunk]);
        trackEnds.push(chunk.end_char);
      }
    });

    return tracks;
  }, [chunks, totalLength]);

  if (chunks.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Document Timeline Track Map</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Length: {totalLength} chars | {timelineTracks.length} Tracks
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            This map displays how chunks cover the document. Staggered tracks show <b>overlaps</b> (regions where blocks vertically align). Click a track to inspect or scroll to that chunk.
          </span>
        </p>
      )}

      {/* Timeline track container */}
      <div className="relative border border-border/80 bg-secondary/15 rounded-lg p-4 overflow-x-auto min-h-[140px] flex flex-col space-y-3 scrollbar-thin">
        {/* Track ruler background lines */}
        <div className="absolute inset-y-0 left-4 right-4 pointer-events-none flex justify-between text-[8px] font-mono text-muted-foreground/30">
          <span className="border-l border-border/40 pl-1">0%</span>
          <span className="border-l border-border/40 pl-1">25%</span>
          <span className="border-l border-border/40 pl-1">50%</span>
          <span className="border-l border-border/40 pl-1">75%</span>
          <span className="border-l border-border/40 pl-1">100%</span>
        </div>

        <div className="relative z-10 w-full space-y-2.5 pt-4">
          {timelineTracks.map((track, trackIdx) => (
            <div key={trackIdx} className="relative h-6 w-full bg-secondary/10 rounded border border-border/20">
              {track.map((chunk) => {
                const isHovered = hoveredChunkId === chunk.id;
                const isSelected = selectedChunkId === chunk.id;
                
                // Calculate percentage offsets
                const left = (chunk.start_char / totalLength) * 100;
                const width = ((chunk.end_char - chunk.start_char) / totalLength) * 100;

                // Unique vs Overlap parts for visual presentation
                // overlap_prev sits at the start, overlap_next sits at the end
                const prevOverlapPercent = chunk.char_count > 0 ? (chunk.overlap_prev / chunk.char_count) * 100 : 0;
                const nextOverlapPercent = chunk.char_count > 0 ? (chunk.overlap_next / chunk.char_count) * 100 : 0;
                
                const cColor = getChunkColor(chunk.id, isHovered || isSelected ? 0.55 : 0.28);
                const bColor = getChunkBorderColor(chunk.id);

                return (
                  <div
                    key={chunk.id}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                    className={`absolute h-full rounded transition-all flex overflow-hidden border cursor-pointer ${
                      isHovered || isSelected
                        ? "ring-1 ring-primary shadow-sm z-20 scale-y-105"
                        : "z-10 hover:z-20 hover:scale-y-105"
                    }`}
                    onClick={() => setSelectedChunkId(chunk.id)}
                    onMouseEnter={() => setHoveredChunkId(chunk.id)}
                    onMouseLeave={() => setHoveredChunkId(null)}
                  >
                    {/* Previous Overlap Segment (Striped Background) */}
                    {chunk.overlap_prev > 0 && (
                      <div
                        style={{
                          width: `${prevOverlapPercent}%`,
                          borderColor: bColor,
                          background: `repeating-linear-gradient(45deg, ${cColor} 0px, ${cColor} 3px, rgba(245,158,11,0.15) 3px, rgba(245,158,11,0.15) 6px)`,
                        }}
                        className="h-full border-r border-dashed shrink-0"
                        title={`Prev Overlap: ${chunk.overlap_prev} chars`}
                      />
                    )}

                    {/* Unique Content Segment (Solid Color) */}
                    <div
                      style={{
                        backgroundColor: cColor,
                        borderColor: bColor,
                      }}
                      className="h-full flex-1 flex items-center justify-center text-[9px] font-mono font-bold text-foreground overflow-hidden truncate px-1"
                    >
                      #{chunk.id}
                    </div>

                    {/* Next Overlap Segment (Striped Background) */}
                    {chunk.overlap_next > 0 && (
                      <div
                        style={{
                          width: `${nextOverlapPercent}%`,
                          borderColor: bColor,
                          background: `repeating-linear-gradient(45deg, ${cColor} 0px, ${cColor} 3px, rgba(245,158,11,0.15) 3px, rgba(245,158,11,0.15) 6px)`,
                        }}
                        className="h-full border-l border-dashed shrink-0"
                        title={`Next Overlap: ${chunk.overlap_next} chars`}
                      />
                    )}

                    {/* Tooltip detail metadata popup */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground border border-border rounded shadow-lg text-[10px] space-y-1 z-50 pointer-events-none w-32 font-sans leading-normal">
                        <div className="font-bold text-primary">Chunk #{chunk.id}</div>
                        <div>Range: {chunk.start_char} - {chunk.end_char}</div>
                        <div>Tokens: ~{chunk.token_count}</div>
                        {chunk.overlap_prev > 0 && <div>Prev Overlap: {chunk.overlap_prev}c</div>}
                        {chunk.overlap_next > 0 && <div>Next Overlap: {chunk.overlap_next}c</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
