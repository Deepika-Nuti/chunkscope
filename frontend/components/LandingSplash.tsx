"use client";

import React from "react";
import { Sparkles, Compass, Lightbulb, CheckCircle2 } from "lucide-react";

interface LandingSplashProps {
  onChoose: (mode: "learning" | "expert") => void;
}

export default function LandingSplash({ onChoose }: LandingSplashProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel border border-primary/25 bg-card/95 max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col text-center relative overflow-hidden animate-fade-in select-none">
        
        {/* Background glow decoration */}
        <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="space-y-2">
          <div className="flex justify-center items-center space-x-2">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              ChunkScope
            </span>
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              v2.0
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            "Visualize, Compare, and Understand Document Chunking & Embeddings for RAG Systems"
          </p>
        </div>

        {/* Mode cards choice row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Card 1: Learn Chunking */}
          <button
            onClick={() => onChoose("learning")}
            className="p-5 border border-primary bg-primary/5 hover:bg-primary/10 rounded-2xl cursor-pointer text-left transition-all duration-200 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-sm text-foreground">
                <Lightbulb className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20 group-hover:scale-110 transition-transform" />
                <span>Learn Chunking</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                Ideal for beginners. Hides advanced mathematical tables and provides a guided stepper to learn step-by-step.
              </p>
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-border/40 text-[9.5px] text-muted-foreground/80 font-medium">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Guided RAG steppers</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Simplified cards view</span>
              </div>
            </div>
          </button>

          {/* Card 2: Advanced Exploration */}
          <button
            onClick={() => onChoose("expert")}
            className="p-5 border border-border bg-secondary/10 hover:bg-secondary/25 hover:border-violet-500/35 rounded-2xl cursor-pointer text-left transition-all duration-200 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-sm text-foreground">
                <Compass className="h-4.5 w-4.5 text-violet-400 group-hover:scale-110 transition-transform" />
                <span>Advanced Exploration</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                Ideal for RAG developers. Exposes PCA plots, cosine correlation matrices, cohesion graphs, and vector spec tables.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/40 text-[9.5px] text-muted-foreground/80 font-medium">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>Similarity matrices</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>Embedding variance plots</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info text */}
        <p className="text-[10px] text-muted-foreground/60 leading-normal flex items-center justify-center space-x-1.5">
          <span>Google DeepMind Pair Programming Session</span>
        </p>
      </div>
    </div>
  );
}
