"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Database, GitBranch } from "lucide-react";
import { useGamification } from "../../../lib/useGamification";

export default function LearnVectorDbPage() {
  const { completeLesson } = useGamification();

  useEffect(() => {
    completeLesson("vector-db", 100);
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 5 of 7</span>
        <span className="text-primary font-bold">Vector Database Indexing</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 5: Vector DB
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How does a Vector Database index chunks?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Storing vectors requires specialized indexing methods to retrieve matches in microseconds.
        </p>
      </div>

      {/* 3. Storyboard graphic */}
      <div className="glass-panel border border-border bg-card/45 p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-muted-foreground">
          <div className="bg-secondary/40 p-5 rounded-xl border border-border/80 space-y-3">
            <h4 className="font-bold text-foreground flex items-center">
              <Database className="h-4 w-4 mr-1.5 text-primary" />
              1. Flat Index (Brute Force)
            </h4>
            <p>
              Compares the query vector against every single chunk in the database.
            </p>
            <div className="text-[10px] text-primary/80 font-bold bg-background p-2 rounded font-mono">
              Accuracy: 100% | Latency: High (scales poorly)
            </div>
          </div>

          <div className="bg-secondary/40 p-5 rounded-xl border border-border/80 space-y-3">
            <h4 className="font-bold text-foreground flex items-center">
              <GitBranch className="h-4 w-4 mr-1.5 text-primary" />
              2. Graph Index (HNSW)
            </h4>
            <p>
              Links similar vectors together like a multi-layered social network. Search hops between linked nodes to find matches instantly.
            </p>
            <div className="text-[10px] text-primary/80 font-bold bg-background p-2 rounded font-mono">
              Accuracy: ~98% | Latency: Microseconds (sub-linear)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/embeddings"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 4</span>
        </Link>

        <Link
          href="/learn/retrieval"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 6: Retrieval</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
