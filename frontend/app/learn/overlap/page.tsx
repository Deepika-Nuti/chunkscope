"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Info, RefreshCw, Hash, Columns } from "lucide-react";
import { useGamification } from "../../../lib/useGamification";
import { motion } from "framer-motion";

export default function LearnOverlapPage() {
  const { completeLesson } = useGamification();
  const [chunkSize, setChunkSize] = useState(300);
  const [overlapVal, setOverlapVal] = useState(100);

  useEffect(() => {
    completeLesson("overlap", 100);
  }, []);

  // Compute mock chunk representations based on size & overlap
  const chunkText1 = "NDA Mutual Agreement. Recipient agrees to hold Discloser's Proprietary Info in strict confidence.";
  const chunkText2 = "strict confidence. Obligations of non-disclosure shall survive termination of this written contract.";
  const chunkText3 = "written contract. Discloser warrants copyrights. Recipient agrees not to copy source files.";

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 3 of 7</span>
        <span className="text-primary font-bold">Context Overlap Buffer</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 3: Chunk Overlap Visualizer
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How do adjacent chunk overlaps work?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Overlap copies characters between neighbors. This guarantees that facts located near sentence splits are replicated on both sides so they aren't lost to RAG query searches.
        </p>
      </div>

      {/* 3. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Adjust Buffer Size
            </span>
            <div className="bg-secondary/40 p-4 border border-border rounded-xl space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Chunk size</span>
                  <span className="font-mono font-bold text-primary">{chunkSize} chars</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="400"
                  step="20"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Overlap size</span>
                  <span className="font-mono font-bold text-primary">{overlapVal} chars</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="10"
                  value={overlapVal}
                  onChange={(e) => setOverlapVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-[10.5px] leading-relaxed text-muted-foreground space-y-1">
            <span className="font-bold text-foreground block uppercase text-[8px] tracking-wider text-primary">LEARNER TARGET</span>
            <p>Tweak the sliders. Watch how Chunk 2 slides under Chunk 1, creating a shared (striped) context boundary buffer.</p>
          </div>
        </div>

        {/* Right column: Interactive Visual Graph */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Hands-On Challenge Card */}
          <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
            overlapVal === 100
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-primary bg-primary/5 text-primary"
          }`}>
            <div className="space-y-1">
              <span className="font-extrabold text-[10px] uppercase tracking-widest block font-mono">
                🎯 Hands-On Mission: Overlap Target
              </span>
              <p className="text-[11px] text-muted-foreground">
                {overlapVal === 100
                  ? "Success! You created a 100-character overlap buffer. Notice the duplicated text regions."
                  : "Challenge: Adjust the 'Overlap size' slider to exactly 100 characters."}
              </p>
            </div>
            
            {overlapVal === 100 && (
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase shrink-0 font-sans">
                Completed
              </span>
            )}
          </div>

          {/* Bar Diagram (Visual Chunk Alignment) */}
          <div className="bg-[#020203] border border-border p-6 rounded-xl space-y-4 relative">
            <span className="text-[8px] font-mono text-muted-foreground/60 uppercase block">Adjacent Buffer Alignment Map</span>
            
            <div className="space-y-3 pt-2">
              {/* Chunk 1 Bar */}
              <div className="flex items-center space-x-3">
                <span className="w-16 text-[10px] font-mono font-bold text-muted-foreground text-right shrink-0">Chunk 1</span>
                <div className="flex-1 bg-secondary/20 h-6 rounded border border-border overflow-hidden relative">
                  <motion.div
                    style={{ width: `${(chunkSize / 400) * 80}%` }}
                    className="h-full bg-indigo-500/25 border-r border-indigo-400/50 flex items-center px-3"
                    layout
                  >
                    <span className="text-[8px] font-mono text-indigo-200 truncate">NDA Mut. Agreement...</span>
                  </motion.div>
                </div>
              </div>

              {/* Chunk 2 Bar */}
              <div className="flex items-center space-x-3">
                <span className="w-16 text-[10px] font-mono font-bold text-muted-foreground text-right shrink-0">Chunk 2</span>
                <div className="flex-1 bg-secondary/20 h-6 rounded border border-border overflow-hidden relative">
                  <motion.div
                    style={{ 
                      width: `${(chunkSize / 400) * 80}%`,
                      marginLeft: `${((chunkSize - overlapVal) / 400) * 80}%`
                    }}
                    className="h-full bg-purple-500/25 border-l border-r border-purple-400/50 flex items-center px-3 relative"
                    layout
                  >
                    {/* Highlighted Overlap Area */}
                    {overlapVal > 0 && (
                      <div 
                        style={{ width: `${(overlapVal / chunkSize) * 100}%` }}
                        className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(45deg,rgba(99,102,241,0.15),rgba(99,102,241,0.15)_5px,rgba(0,0,0,0)_5px,rgba(0,0,0,0)_10px)] border-r border-indigo-400/40"
                      />
                    )}
                    <span className="text-[8px] font-mono text-purple-200 truncate z-10 pl-2">Obligations...</span>
                  </motion.div>
                </div>
              </div>

              {/* Chunk 3 Bar */}
              <div className="flex items-center space-x-3">
                <span className="w-16 text-[10px] font-mono font-bold text-muted-foreground text-right shrink-0">Chunk 3</span>
                <div className="flex-1 bg-secondary/20 h-6 rounded border border-border overflow-hidden relative">
                  <motion.div
                    style={{ 
                      width: `${(chunkSize / 400) * 80}%`,
                      marginLeft: `${((chunkSize * 2 - overlapVal * 2) / 400) * 80}%`
                    }}
                    className="h-full bg-pink-500/25 border-l border-pink-400/50 flex items-center px-3 relative"
                    layout
                  >
                    {/* Highlighted Overlap Area */}
                    {overlapVal > 0 && (
                      <div 
                        style={{ width: `${(overlapVal / chunkSize) * 100}%` }}
                        className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(45deg,rgba(236,72,153,0.15),rgba(236,72,153,0.15)_5px,rgba(0,0,0,0)_5px,rgba(0,0,0,0)_10px)] border-r border-pink-400/40"
                      />
                    )}
                    <span className="text-[8px] font-mono text-pink-200 truncate z-10 pl-2">Discloser warrants...</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Copies (Semantic continuity) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10.5px] font-sans">
            <div className="p-3 bg-secondary/20 border border-border rounded-xl space-y-1.5">
              <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase">CHUNK 1 TEXT</span>
              <p className="text-zinc-400 leading-normal">
                "NDA Mutual Agreement. Recipient agrees to hold Discloser's Proprietary Info in <b className="text-indigo-300 bg-indigo-500/10 px-1 rounded">strict confidence.</b>"
              </p>
            </div>
            <div className="p-3 bg-secondary/20 border border-border rounded-xl space-y-1.5">
              <span className="text-[8px] font-mono font-bold text-purple-400 uppercase">CHUNK 2 TEXT</span>
              <p className="text-zinc-400 leading-normal">
                "{overlapVal > 0 ? (
                  <b className="text-indigo-300 bg-indigo-500/10 px-1 rounded">strict confidence.</b>
                ) : (
                  <span className="text-zinc-600 line-through">...</span>
                )} Obligations of non-disclosure shall survive termination of this <b className="text-purple-300 bg-purple-500/10 px-1 rounded">written contract.</b>"
              </p>
            </div>
            <div className="p-3 bg-secondary/20 border border-border rounded-xl space-y-1.5">
              <span className="text-[8px] font-mono font-bold text-pink-400 uppercase">CHUNK 3 TEXT</span>
              <p className="text-zinc-400 leading-normal">
                "{overlapVal > 0 ? (
                  <b className="text-purple-300 bg-purple-500/10 px-1 rounded">written contract.</b>
                ) : (
                  <span className="text-zinc-600 line-through">...</span>
                )} Discloser warrants copyrights. Recipient agrees not to copy source files."
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Sticky Explanation Panel */}
      <div className="p-5 bg-secondary/15 border border-border/80 rounded-2xl text-xs space-y-3">
        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground flex items-center">
          <Info className="h-4 w-4 mr-1 text-primary animate-pulse" />
          What just happened? (Concept breakdown)
        </h4>
        <p className="text-muted-foreground text-[11.5px] leading-relaxed">
          When overlap is set to <b>{overlapVal} characters</b>, text segments at boundaries are cloned. If overlap was 0, the phrase "strict confidence" is split. A query searching for "strict confidence obligations" would return zero complete matches, breaking prompt retrieval. With an overlap buffer, the system maintains semantic coherence across boundaries.
        </p>
      </div>

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
