"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Info, RefreshCw, Play, Settings, BookOpen } from "lucide-react";
import StrategyCard from "../../../components/StrategyCard";
import LiveVisualizer from "../../../components/LiveVisualizer";
import WatchChunking from "../../../components/WatchChunking";
import { FileMetadata, chunkText } from "../../../lib/api";
import { Chunk, ChunkParams } from "../../../lib/fallback-engine";
import { useGamification } from "../../../lib/useGamification";

export default function LearnChunkingPage() {
  const { completeLesson } = useGamification();
  const [documentMetadata, setDocumentMetadata] = useState<FileMetadata | null>(null);
  const [strategy, setStrategy] = useState<string>("recursive");
  const [params, setParams] = useState<ChunkParams>({
    chunk_size: 500,
    chunk_overlap: 80,
    sentences_per_chunk: 3,
    paragraphs_per_chunk: 1,
  });

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWatchOpen, setIsWatchOpen] = useState(false);

  // Auto-load demo clinical document to make onboarding instant
  useEffect(() => {
    const sampleText = `Cardiology Consult - Patient Deepika
Chief Complaint: Atypical chest pain.
History of Present Illness: The patient describes chest discomfort that occurs on exertion, described as squeezing.
Assessment & Plan: Optimize medical management. Initiate Atorvastatin 40 mg. Schedule cardiac catheterization to determine if coronary intervention is needed.`;
    
    setDocumentMetadata({
      filename: "cardiology_consult.txt",
      file_size: 340,
      page_count: 1,
      word_count: 52,
      char_count: sampleText.length,
      token_count: 75,
      text: sampleText
    });

    completeLesson("chunking", 100);
  }, []);

  // Update chunks
  useEffect(() => {
    if (!documentMetadata) return;
    setIsProcessing(true);
    chunkText(documentMetadata.text, strategy, params)
      .then((res) => {
        setChunks(res.chunks);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [documentMetadata, strategy, params.chunk_size, params.chunk_overlap, params.sentences_per_chunk]);

  // Strategy specific metrics details
  const getStrategyEduCard = () => {
    switch (strategy) {
      case "fixed":
        return {
          animationDesc: "Chops characters into exact sizes, ignoring punctuation.",
          tokenBounds: "Arbitrary character counts (strict cutoffs).",
          transitions: "Words and sentences are cut in half.",
          semanticBounds: "None. Zero logical boundary check.",
        };
      case "recursive":
        return {
          animationDesc: "Tries double newlines, single newlines, then spaces recursively.",
          tokenBounds: "Bounded by structural delimiters.",
          transitions: "Coherent transitions, keeping thoughts whole.",
          semanticBounds: "Paragraphs and sentences are preserved.",
        };
      case "sentence":
        return {
          animationDesc: "Groups complete sentences using period-space tags.",
          tokenBounds: "Variable character length based on sentence size.",
          transitions: "Preserves individual complete thoughts.",
          semanticBounds: "Highly descriptive sentence-level splits.",
        };
      case "paragraph":
        return {
          animationDesc: "Groups text separated by double newlines.",
          tokenBounds: "Highly variable size depending on block formatting.",
          transitions: "Large topic shifts preserved neatly.",
          semanticBounds: "Logical thematic sections remain grouped.",
        };
      case "sliding":
        return {
          animationDesc: "Sliding window moves with a stride offset to duplicate boundaries.",
          tokenBounds: "Dense duplicate ranges for retrieval search.",
          transitions: "Maximum continuity across adjacent text ranges.",
          semanticBounds: "Thematic overlap ensures context is never lost.",
        };
      default:
        return {
          animationDesc: "Standard split boundaries.",
          tokenBounds: "Standard range limits.",
          transitions: "Boundary cuts.",
          semanticBounds: "Punctuation markers.",
        };
    }
  };

  const eduInfo = getStrategyEduCard();

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 2 of 7</span>
        <span className="text-primary font-bold">Document Chunking</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 2: Chunking Strategy Playground
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How do chunking strategies split text?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Observe how document boundaries are mapped. Select a strategy in the left sidebar, adjust sizes, and watch the token boundaries reorganize.
        </p>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Controls & Selector details */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              1. Split Rule
            </span>
            <StrategyCard
              selectedStrategy={strategy}
              onSelect={(s) => {
                setChunks([]);
                setStrategy(s);
              }}
              isLearningMode={true}
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              2. Chunk Constraints
            </span>
            <div className="bg-secondary/40 p-4 border border-border rounded-xl space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Chunk Size</span>
                  <span className="font-mono font-bold text-primary">{params.chunk_size} chars</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={params.chunk_size}
                  onChange={(e) => setParams({ ...params, chunk_size: parseInt(e.target.value) })}
                  className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Chunk Overlap</span>
                  <span className="font-mono font-bold text-primary">{params.chunk_overlap} chars</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="20"
                  value={params.chunk_overlap}
                  onChange={(e) => setParams({ ...params, chunk_overlap: parseInt(e.target.value) })}
                  className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Watch Chunking Happen Trigger button */}
          <button
            onClick={() => setIsWatchOpen(true)}
            className="w-full py-2.5 bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/95 rounded-xl cursor-pointer font-extrabold text-[10.5px] flex items-center justify-center space-x-2 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            <span>Play Chunking Animation</span>
          </button>
        </div>

        {/* Right Side: Clean Visualization Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Hands-On Challenge Card */}
          <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
            chunks.length === 2
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-primary bg-primary/5 text-primary"
          }`}>
            <div className="space-y-1">
              <span className="font-extrabold text-[10px] uppercase tracking-widest block font-mono">
                🎯 Hands-On Mission: Split Optimizer
              </span>
              <p className="text-[11px] text-muted-foreground">
                {chunks.length === 2
                  ? "Success! You optimized the splits. Deepika's report is grouped into exactly 2 balanced nodes."
                  : "Challenge: Tweak 'Chunk Size' and select a strategy to split the report into exactly 2 chunks."}
              </p>
            </div>
            
            {chunks.length === 2 && (
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase shrink-0 font-sans">
                Completed
              </span>
            )}
          </div>

          {/* Strategy Details list */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/15 p-4 border border-border/60 rounded-xl text-[10px] font-mono leading-normal">
            <div>
              <span className="text-primary font-bold block mb-0.5">GENERATION PROCESS:</span>
              <span className="text-zinc-400">{eduInfo.animationDesc}</span>
            </div>
            <div>
              <span className="text-primary font-bold block mb-0.5">TOKEN BOUNDS:</span>
              <span className="text-zinc-400">{eduInfo.tokenBounds}</span>
            </div>
            <div>
              <span className="text-primary font-bold block mb-0.5">OVERLAP TRANSITION:</span>
              <span className="text-zinc-400">{eduInfo.transitions}</span>
            </div>
            <div>
              <span className="text-primary font-bold block mb-0.5">SEMANTIC INTEGRITY:</span>
              <span className="text-zinc-400">{eduInfo.semanticBounds}</span>
            </div>
          </div>

          {isProcessing ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-card/25 border border-border border-dashed rounded-2xl animate-pulse">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
              <span>Splitting paragraphs...</span>
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
            What just happened? (Concept breakdown)
          </h4>
          <p className="text-muted-foreground text-[11.5px] leading-relaxed">
            Selecting <b>{strategy === "fixed" ? "Fixed Size" : "Recursive Character"}</b> splits the report into <b>{chunks.length} chunks</b>. Fixed sizing ignores punctuation tags (cutting sentences in half). Recursive chunking searches for paragraph boundaries first, single newlines second, and whitespace margins third, preserving semantic integrity.
          </p>
        </div>
      )}

      {/* 5. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/why-rag"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 1</span>
        </Link>

        <Link
          href="/learn/overlap"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 3: Overlaps</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Real-time Watch Chunking simulation modal */}
      {isWatchOpen && documentMetadata && (
        <WatchChunking
          originalText={documentMetadata.text}
          strategy={strategy}
          params={params}
          onClose={() => setIsWatchOpen(false)}
        />
      )}
    </div>
  );
}
