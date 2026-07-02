"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, HelpCircle, FileText, Brain, HeartPulse } from "lucide-react";

export default function WhyRagLesson() {
  const [pipelineMode, setPipelineMode] = useState<"naive" | "rag">("naive");

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-8 space-y-12">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 1 of 7</span>
        <span className="text-primary font-bold">Why RAG?</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Core RAG Question
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Why do we need Retrieval-Augmented Generation?
        </h1>
      </div>

      {/* 3. Interactive Visualization Section (75% Viewport width styling) */}
      <div className="glass-panel border border-border bg-card/45 p-8 rounded-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-border/40 pb-4">
          <span className="text-xs font-bold text-foreground">Interactive Simulator: Naive LLM vs. RAG Pipeline</span>
          <div className="flex space-x-1.5 p-0.5 bg-secondary/40 border border-border rounded-lg text-xs">
            <button
              onClick={() => setPipelineMode("naive")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                pipelineMode === "naive" ? "bg-card text-primary shadow" : "text-muted-foreground"
              }`}
            >
              Without RAG
            </button>
            <button
              onClick={() => setPipelineMode("rag")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                pipelineMode === "rag" ? "bg-card text-primary shadow" : "text-muted-foreground"
              }`}
            >
              With RAG
            </button>
          </div>
        </div>

        {/* Dynamic Graphic Simulation */}
        <div className="min-h-[220px] flex flex-col justify-between space-y-6 bg-[#020204] border border-border/60 p-6 rounded-xl relative overflow-hidden">
          {pipelineMode === "naive" ? (
            <>
              {/* Naive Flow */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="bg-secondary/45 p-4 rounded-xl border border-border/80 max-w-xs space-y-2">
                  <span className="text-[9px] font-bold text-rose-400 block font-mono">USER QUERY</span>
                  <p className="text-xs text-foreground font-semibold">"What medication was prescribed for patient Deepika's cardiology chest pains?"</p>
                </div>

                <div className="text-muted-foreground font-mono text-xs animate-pulse">
                  ---- sends directly ----&gt;
                </div>

                <div className="bg-secondary/45 p-4 rounded-xl border border-border/80 max-w-xs space-y-2">
                  <span className="text-[9px] font-bold text-rose-400 block font-mono">LLM PRE-TRAINED MEMORY</span>
                  <p className="text-xs text-muted-foreground italic">"Prescriptions aren't in my training set. I will hypothesize/hallucinate: 'Patient was prescribed Aspirin 325mg...'"</p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-xs text-muted-foreground rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <p className="text-[11px] leading-relaxed">
                  <b>Fatal Hallucination Risk</b>: The model lacks access to patient reports, leading it to invent medical prescriptions. General models have static training dates and cannot retrieve custom personal records.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* RAG Flow */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-[11px] font-sans">
                {/* 1. Query */}
                <div className="bg-secondary/45 p-3 rounded-lg border border-border/80 max-w-xs space-y-1.5">
                  <span className="text-[8px] font-bold text-emerald-400 block font-mono">1. USER QUERY</span>
                  <p className="text-[10px] text-foreground font-semibold">"Prescription for Deepika's chest pains?"</p>
                </div>

                <div className="text-muted-foreground font-mono text-[9px] rotate-90 lg:rotate-0">--&gt;</div>

                {/* 2. Retrieve */}
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 max-w-xs space-y-1.5">
                  <span className="text-[8px] font-bold text-primary block font-mono">2. VECTOR SEARCH RETRIEVAL</span>
                  <p className="text-[10px] text-muted-foreground truncate">Searches database {"->"} retrieves Chunk #12 (NDAs, Cardiology consults)...</p>
                </div>

                <div className="text-muted-foreground font-mono text-[9px] rotate-90 lg:rotate-0">--&gt;</div>

                {/* 3. Augmented prompt */}
                <div className="bg-secondary/45 p-3 rounded-lg border border-border/80 max-w-xs space-y-1.5">
                  <span className="text-[8px] font-bold text-emerald-400 block font-mono">3. AUGMENTED PROMPT</span>
                  <p className="text-[10px] text-muted-foreground italic">"Context: Deepika was prescribed Lipitor 40mg. Answer the question..."</p>
                </div>

                <div className="text-muted-foreground font-mono text-[9px] rotate-90 lg:rotate-0">--&gt;</div>

                {/* 4. Generation */}
                <div className="bg-secondary/45 p-3 rounded-lg border border-border/80 max-w-xs space-y-1.5 font-bold">
                  <span className="text-[8px] font-bold text-emerald-400 block font-mono">4. GROUNDED LLM GENERATION</span>
                  <p className="text-[10px] text-foreground">"Deepika was prescribed Lipitor (Atorvastatin) 40mg at bedtime."</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground rounded-lg flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[11px] leading-relaxed">
                  <b>Grounded Accuracy</b>: RAG injects the retrieved cardiology consult text segment directly into the prompt. The LLM acts as an editor, referencing concrete facts instead of guessing.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. "What Just Happened?" Explanations Panel */}
      <div className="p-5 bg-secondary/15 border border-border/80 rounded-2xl text-xs space-y-3">
        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground flex items-center">
          <Brain className="h-4 w-4 mr-1 text-primary" />
          What just happened? (Concept breakdown)
        </h4>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Retrieval-Augmented Generation acts as an **open-book exam** for AI. The document index behaves like the library, the vector search behaves like the catalog, and chunk splits represent index entries. 
        </p>
      </div>

      {/* 5. Navigation Steppers */}
      <div className="flex justify-end pt-4">
        <Link
          href="/learn/chunking"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 2: Chunking</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// Add simple AlertCircle icon fallback
function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
