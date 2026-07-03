"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, HelpCircle, FileText, Brain, AlertTriangle, CheckCircle, Info } from "lucide-react";
import PipelineSimulator from "../../../components/PipelineSimulator";
import { useGamification } from "../../../lib/useGamification";

export default function WhyRagLesson() {
  const [pipelineMode, setPipelineMode] = useState<"bad" | "good">("bad");
  const { completeLesson } = useGamification();

  // Mark lesson as complete on mount or view
  useEffect(() => {
    completeLesson("why-rag", 100);
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 1 of 7</span>
        <span className="text-primary font-bold">Why RAG & Chunking?</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 1: What is Chunking?
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Understanding the Document to Retrieval Pipeline
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Chunking is the foundation of Retrieval-Augmented Generation (RAG). Before an LLM can read large documents, they must be parsed, segmented, converted into vector coordinates, and indexed in a database.
        </p>
      </div>

      {/* RAG Pipeline flow component (Lesson 1 flowchart animation) */}
      <PipelineSimulator />

      {/* Divider */}
      <hr className="border-border/60" />

      {/* Lesson 2 Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
            <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
            Lesson 2: Why Chunking Matters
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Bad Chunking vs. Good Chunking Comparison
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            How we split text determines whether the system answers correctly or hallucinated medical details.
          </p>
        </div>

        {/* Bad vs Good comparison visualizer */}
        <div className="glass-panel border border-border bg-card/45 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <span className="text-xs font-bold text-foreground">Interactive Simulator: Retrieval Precision</span>
            <div className="flex space-x-1.5 p-0.5 bg-secondary/40 border border-border rounded-lg text-xs">
              <button
                onClick={() => setPipelineMode("bad")}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  pipelineMode === "bad" ? "bg-card text-rose-400 shadow-sm" : "text-muted-foreground"
                }`}
              >
                Bad Chunking (Split-in-Half)
              </button>
              <button
                onClick={() => setPipelineMode("good")}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  pipelineMode === "good" ? "bg-card text-emerald-400 shadow-sm" : "text-muted-foreground"
                }`}
              >
                Good Chunking (Clean Sentences)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#020204] p-5 rounded-xl border border-border/80 text-[11px] font-mono leading-relaxed">
            {pipelineMode === "bad" ? (
              <>
                {/* Bad Chunking Side */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[8px] font-bold text-rose-400 block uppercase">Generated Chunks</span>
                    <div className="p-3 border border-rose-500/20 bg-rose-500/5 rounded space-y-2">
                      <div className="text-[9px] text-muted-foreground border-b border-border/40 pb-1">Chunk #1 (Chop range: 0-112)</div>
                      <p className="text-zinc-400">"Cardiology Consult - Patient Deepika. Chief Complaint: Atypical chest pain occurs on exertion. Presc"</p>
                    </div>
                    <div className="p-3 border border-rose-500/20 bg-rose-500/5 rounded space-y-2">
                      <div className="text-[9px] text-muted-foreground border-b border-border/40 pb-1">Chunk #2 (Chop range: 112-210)</div>
                      <p className="text-zinc-400">"ribed Atorvastatin 40 mg at bedtime."</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <span className="text-[8px] font-bold text-rose-400 block uppercase">Retrieval result & Hallucination</span>
                    
                    <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 text-muted-foreground rounded-lg flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <b>Weak Cosine Match (35%)</b>
                        <p className="text-[10px] pt-1">The key search term "prescribed" was sliced into "Presc" and "ribed". Query vectors fail to match.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/30 rounded border border-border/60 space-y-1">
                      <span className="text-[8px] text-muted-foreground block">LLM RESPONSE</span>
                      <p className="text-rose-400 italic">"Based on the provided patient files, Deepika was prescribed Aspirin 325mg."</p>
                      <span className="text-[8px] text-rose-500/60 block pt-1 font-bold">✗ HALLUCINATION RISK (Dangerous clinical advice)</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Good Chunking Side */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[8px] font-bold text-emerald-400 block uppercase">Generated Chunks</span>
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded space-y-2">
                      <div className="text-[9px] text-muted-foreground border-b border-border/40 pb-1">Chunk #1 (Sentence aligned)</div>
                      <p className="text-zinc-400">"Cardiology Consult - Patient Deepika. Chief Complaint: Atypical chest pain occurs on exertion."</p>
                    </div>
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded space-y-2">
                      <div className="text-[9px] text-muted-foreground border-b border-border/40 pb-1">Chunk #2 (Sentence aligned)</div>
                      <p className="text-zinc-400">"Assessment & Plan: Initiate Atorvastatin 40 mg at bedtime."</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <span className="text-[8px] font-bold text-emerald-400 block uppercase">Retrieval result & Grounded Answer</span>
                    
                    <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-muted-foreground rounded-lg flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <b>High Cosine Match (95%)</b>
                        <p className="text-[10px] pt-1">The query matches Chunk #2 cleanly. The full context survives the split intact.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/30 rounded border border-border/60 space-y-1">
                      <span className="text-[8px] text-muted-foreground block">LLM RESPONSE</span>
                      <p className="text-emerald-400">"According to the plan, patient Deepika was prescribed Atorvastatin 40 mg at bedtime."</p>
                      <span className="text-[8px] text-emerald-500/60 block pt-1 font-bold">✓ GROUNDED ANSWER (100% Correct)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. "What Just Happened?" Explanations Panel */}
      <div className="p-5 bg-secondary/15 border border-border/80 rounded-2xl text-xs space-y-3">
        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground flex items-center">
          <Brain className="h-4 w-4 mr-1 text-primary" />
          What just happened? (Concept breakdown)
        </h4>
        <p className="text-muted-foreground text-[11.5px] leading-relaxed">
          Retrieval-Augmented Generation behaves like an open-book exam. If you tear the pages of the textbook in half arbitrarily (Bad Chunking), the sentence is broken, causing search failure and forcing the LLM to hallucinate or guess. When we respect sentence and paragraph boundaries (Good Chunking), we preserve context and accuracy.
        </p>
      </div>

      {/* 5. Navigation Steppers */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Back to Syllabus</span>
        </Link>
        <Link
          href="/learn/chunking"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 2: Strategies</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
