"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, HelpCircle, CheckCircle2, Play } from "lucide-react";
import PipelineSimulator from "../../../components/PipelineSimulator";
import { useGamification } from "../../../lib/useGamification";

export default function LearnPipelinePage() {
  const { completeLesson } = useGamification();

  useEffect(() => {
    // Reward 200 XP for completing the final pipeline simulation capstone
    completeLesson("rag-pipeline", 200);
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 7 of 7</span>
        <span className="text-primary font-bold">RAG Pipeline</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 7: Complete RAG Pipeline Simulator
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How does the complete RAG pipeline connect?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          RAG is a multi-stage data architecture bridging document processing, database indexing, similarity querying, and LLM inference generation.
        </p>
      </div>

      {/* 3. Pipeline simulator */}
      <PipelineSimulator />

      {/* Course Completion Announcement Card */}
      <div className="p-6 border border-emerald-500 bg-emerald-500/10 text-emerald-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-extrabold text-sm uppercase tracking-wide flex items-center justify-center sm:justify-start">
            <CheckCircle2 className="h-4.5 w-4.5 mr-1.5 text-emerald-400 shrink-0" />
            Congratulations! Course Complete
          </h4>
          <p className="text-[11px] text-muted-foreground">
            You completed all RAG learning modules. You unlocked +200 XP and achieved course mastery.
          </p>
        </div>
        <Link
          href="/learn"
          className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shrink-0"
        >
          View Achievements
        </Link>
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
          <span>Syllabus Roadmap</span>
        </Link>
      </div>
    </div>
  );
}
