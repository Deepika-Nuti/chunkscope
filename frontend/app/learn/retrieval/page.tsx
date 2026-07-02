"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Layers, MessageSquare } from "lucide-react";

export default function LearnRetrievalPage() {
  const [topK, setTopK] = useState(2);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-8 space-y-12">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 6 of 7</span>
        <span className="text-primary font-bold">RAG Retrieval</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Retrieval Lesson
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How does semantic retrieval work?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Retrieval is the online phase where Top-K context chunks are matched and assembled into a prompt.
        </p>
      </div>

      {/* 3. Interactive parameter assembly storyboard */}
      <div className="glass-panel border border-border bg-card/45 p-8 rounded-2xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-border/40 text-xs">
          <span className="font-bold text-foreground">Assembled LLM Prompt Constructor</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-muted-foreground">Top-K:</span>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-16 h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
            />
            <span className="font-bold text-primary font-mono">{topK}</span>
          </div>
        </div>

        {/* Dynamic Prompt code rendering */}
        <div className="p-5 bg-[#020204] border border-border/80 rounded-xl text-xs font-mono text-muted-foreground space-y-3 leading-relaxed">
          <div>
            <span className="text-emerald-400 font-bold block"># System Instruction Prompt</span>
            <span>"Answer the query using only the provided context snippets below."</span>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-indigo-400 font-bold block"># Retrieved Context Snips</span>
            <div>[Retrieved Chunk #12: "Patient chest pains squeezing. Prescribed Lipitor 40mg."]</div>
            {topK >= 2 && (
              <div>[Retrieved Chunk #13: "Discomfort occurs on physical exertion. Schedule cardiology test."]</div>
            )}
            {topK >= 3 && (
              <div>[Retrieved Chunk #14: "Prior assessment history: stable angina diagnosed in 2024."]</div>
            )}
          </div>
          
          <div className="pt-2 border-t border-border/40">
            <span className="text-primary font-bold block"># User Question Query</span>
            <span>"Why did patient schedule cardiology consult?"</span>
          </div>
        </div>
      </div>

      {/* 4. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/vector-db"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 5</span>
        </Link>

        <Link
          href="/learn/rag-pipeline"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 7: Complete Pipeline</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
