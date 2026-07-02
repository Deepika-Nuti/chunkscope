"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, HelpCircle, GitCommit, Play } from "lucide-react";

export default function LearnPipelinePage() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-8 space-y-12">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 7 of 7</span>
        <span className="text-primary font-bold">RAG Pipeline</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          RAG Pipeline Lesson
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How does the complete RAG pipeline connect?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          RAG is a multi-stage data architecture bridging document processing databases and LLM inference calls.
        </p>
      </div>

      {/* 3. Pipeline flowchart illustration */}
      <div className="glass-panel border border-border bg-card/45 p-8 rounded-2xl space-y-6">
        <div className="flex flex-col space-y-6 text-xs text-muted-foreground leading-normal font-sans">
          <div className="flex items-center space-x-3 bg-secondary/35 border border-border/80 p-3 rounded-xl">
            <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/45 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0">
              1
            </div>
            <div>
              <b className="text-foreground font-semibold block">Ingest & Chunk</b>
              <span>Break Deepika's consult report into 500-character segments preserving sentences.</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-secondary/35 border border-border/80 p-3 rounded-xl">
            <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/45 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0">
              2
            </div>
            <div>
              <b className="text-foreground font-semibold block">Embed & Index</b>
              <span>Run SentenceTransformers to compute 384d vectors and store them in HNSW graph indexes.</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-secondary/35 border border-border/80 p-3 rounded-xl">
            <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/45 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0">
              3
            </div>
            <div>
              <b className="text-foreground font-semibold block">Retrieve & Ground</b>
              <span>Perform Cosine Proximity lookup on query to bundle the Top-K chunks inside a prompt for LLM answer generation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/retrieval"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 6</span>
        </Link>

        <Link
          href="/learn"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-6 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-1.5 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <Play className="h-4 w-4 mr-1 text-primary-foreground shrink-0 fill-current" />
          <span>Finish Course & Review Syllabus</span>
        </Link>
      </div>
    </div>
  );
}
