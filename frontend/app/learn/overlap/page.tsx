"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Info, RefreshCw } from "lucide-react";
import LiveVisualizer from "../../../components/LiveVisualizer";
import { FileMetadata, chunkText } from "../../../lib/api";
import { Chunk, ChunkParams } from "../../../lib/fallback-engine";

export default function LearnOverlapPage() {
  const [documentMetadata, setDocumentMetadata] = useState<FileMetadata | null>(null);
  const [overlapVal, setOverlapVal] = useState(100);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const sampleText = `NDA Agreement. Recipient agrees to hold the Disclosing Party's Proprietary Information in strict confidence. This obligation shall survive termination of this agreement.`;
    setDocumentMetadata({
      filename: "nda_document.txt",
      file_size: 210,
      page_count: 1,
      word_count: 22,
      char_count: sampleText.length,
      token_count: 45,
      text: sampleText
    });
  }, []);

  useEffect(() => {
    if (!documentMetadata) return;
    setIsProcessing(true);
    // Use fixed chunk size of 300, and dynamic overlap values
    chunkText(documentMetadata.text, "fixed", {
      chunk_size: 300,
      chunk_overlap: overlapVal
    })
      .then((res) => {
        setChunks(res.chunks);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [documentMetadata, overlapVal]);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-10 px-8 space-y-12">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 3 of 7</span>
        <span className="text-primary font-bold">Context Overlap</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Overlap Lesson
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Why do chunk overlaps matter?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Overlap copies characters between adjacent chunks. This guarantees that facts located near boundaries aren't split in half and lost.
        </p>
      </div>

      {/* 3. Main Workspace Grid - 75% Width spacing rule */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Overlap Sizing Controls (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Adjust Overlap
            </span>
            <div className="bg-secondary/40 p-4 border border-border rounded-xl space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Overlap Length</span>
                  <span className="font-mono font-bold text-primary">{overlapVal} chars</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="20"
                  value={overlapVal}
                  onChange={(e) => setOverlapVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-[10.5px] leading-relaxed text-muted-foreground space-y-1">
            <span className="font-bold text-foreground block uppercase text-[8px] tracking-wider text-primary">LEARNER TARGET</span>
            <p>Drag the slider to <b>0</b> and observe the boundaries. Then drag to <b>100</b> and look at the striped overlap lines.</p>
          </div>
        </div>

        {/* Right Side: Clean Visualization Area (3 columns - 75% width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hands-On Challenge Card */}
          <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
            overlapVal === 100
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-primary bg-primary/5 text-primary"
          }`}>
            <div className="space-y-1">
              <span className="font-extrabold text-[10px] uppercase tracking-widest block font-mono">
                🎯 Hands-On Mission: Overlap Buffer
              </span>
              <p className="text-[11px] text-muted-foreground">
                {overlapVal === 100
                  ? "Success! You activated a 100-character overlap buffer. Check the striped overlapping text region."
                  : "Challenge: Adjust the 'Overlap Length' slider to exactly 100 characters."}
              </p>
            </div>
            
            {overlapVal === 100 && (
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase shrink-0 font-sans">
                Completed
              </span>
            )}
          </div>

          {isProcessing ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-card/25 border border-border border-dashed rounded-2xl animate-pulse">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
              <span>Updating overlap boundaries...</span>
            </div>
          ) : documentMetadata ? (
            <LiveVisualizer
              originalText={documentMetadata.text}
              chunks={chunks}
              hoveredChunkId={null}
              setHoveredChunkId={() => {}}
              selectedChunkId={null}
              setSelectedChunkId={() => {}}
            />
          ) : null}
        </div>
      </div>

      {/* 4. Sticky Explanation Panel */}
      {documentMetadata && chunks.length > 0 && (
        <div className="p-5 bg-secondary/15 border border-border/80 rounded-2xl text-xs space-y-3">
          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground flex items-center">
            <Info className="h-4 w-4 mr-1 text-primary animate-pulse" />
            What just happened?
          </h4>
          <p className="text-muted-foreground text-[11.5px] leading-relaxed">
            When overlap is set to <b>{overlapVal} characters</b>, the striped section represents characters replicated in both chunks. If overlap is 0, the phrase "strict confidence" could be chopped exactly in half ("strict c" in chunk 1, "onfidence" in chunk 2), making retrieval vector match impossible.
          </p>
        </div>
      )}

      {/* 5. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/chunking"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 2</span>
        </Link>

        <Link
          href="/learn/embeddings"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 4: Embeddings</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
