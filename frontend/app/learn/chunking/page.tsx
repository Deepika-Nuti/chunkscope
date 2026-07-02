"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Info, RefreshCw, Settings, FileText } from "lucide-react";
import DocumentUpload from "../../../components/DocumentUpload";
import StrategyCard from "../../../components/StrategyCard";
import ParameterPanel from "../../../components/ParameterPanel";
import LiveVisualizer from "../../../components/LiveVisualizer";
import { FileMetadata, chunkText } from "../../../lib/api";
import { Chunk, ChunkParams } from "../../../lib/fallback-engine";

export default function LearnChunkingPage() {
  const [documentMetadata, setDocumentMetadata] = useState<FileMetadata | null>(null);
  const [strategy, setStrategy] = useState<string>("recursive");
  const [params, setParams] = useState<ChunkParams>({
    chunk_size: 600,
    chunk_overlap: 0, // Keep overlap 0 in lesson 2 to focus on splits
    sentences_per_chunk: 3,
    paragraphs_per_chunk: 1,
  });

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-load demo clinical document to make onboarding instant
  useEffect(() => {
    // Cardiology consult sample text
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
  }, [documentMetadata, strategy, params.chunk_size, params.sentences_per_chunk]);

  const handleUploadSuccess = (meta: FileMetadata) => {
    setChunks([]);
    setDocumentMetadata(meta);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-10 px-8 space-y-12">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 2 of 7</span>
        <span className="text-primary font-bold">Document Chunking</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Chunking Lesson
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How does document chunking work?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Chunking is the process of breaking a single long document into smaller, coherent text nodes. Observe how boundaries behave when strategies change.
        </p>
      </div>

      {/* 3. Main Workspace Grid - 75% Width spacing rule */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Simplified Strategy controls (1 column) */}
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
              2. Adjust Size
            </span>
            <div className="bg-secondary/40 p-4 border border-border rounded-xl space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Chunk Length</span>
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
            </div>
          </div>
        </div>

        {/* Right Side: Clean Visualization Area (3 columns - 75% width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hands-On Challenge Card */}
          <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
            chunks.length === 2
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-primary bg-primary/5 text-primary"
          }`}>
            <div className="space-y-1">
              <span className="font-extrabold text-[10px] uppercase tracking-widest block font-mono">
                🎯 Hands-On Mission: Split Config
              </span>
              <p className="text-[11px] text-muted-foreground">
                {chunks.length === 2
                  ? "Success! You found a size setting that splits the report into exactly 2 balanced paragraphs."
                  : "Challenge: Adjust the 'Chunk Length' slider in the left panel until the document is split into exactly 2 chunks."}
              </p>
            </div>
            
            {chunks.length === 2 && (
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase shrink-0 font-sans">
                Completed
              </span>
            )}
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
            What just happened?
          </h4>
          <p className="text-muted-foreground text-[11.5px] leading-relaxed">
            By selecting <b>{strategy === "fixed" ? "Fixed Size" : "Recursive Character"}</b> strategy, Deepika's consult report was cut into <b>{chunks.length} chunks</b>. Notice how the visualizer highlights boundaries. If size is too small, paragraphs get split in the middle of sentences, causing context loss.
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
    </div>
  );
}
