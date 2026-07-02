"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Compass, Sparkles, Activity } from "lucide-react";

export default function GatewayPage() {
  return (
    <div className="dark min-h-screen bg-[#030303] text-foreground font-sans relative overflow-hidden flex flex-col justify-between select-none">
      
      {/* Background glow decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            ChunkScope
          </span>
        </div>
      </header>

      {/* Core Gateways Choice Layout */}
      <section className="flex-1 w-full max-w-4xl mx-auto px-6 flex flex-col justify-center items-center text-center z-10 relative space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to ChunkScope</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Choose Your Experience
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Learn the core RAG concepts step-by-step or enter the laboratory optimization workshop.
          </p>
        </div>

        {/* Choice columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl text-left">
          
          {/* Option 1: Learn RAG */}
          <Link
            href="/learn"
            className="p-6 md:p-8 border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-6 shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 font-extrabold text-lg text-foreground">
                <BookOpen className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Learn RAG</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Interactive course lessons for understanding chunk splits, overlaps, and vectors. Perfect for beginners and educators.
              </p>
            </div>
            <div className="text-[10px] text-primary font-bold font-mono tracking-wider uppercase pt-4 border-t border-border/40">
              Start Lessons &gt;
            </div>
          </Link>

          {/* Option 2: RAG Lab */}
          <Link
            href="/lab/chunking"
            className="p-6 md:p-8 border border-border bg-secondary/15 hover:bg-secondary/25 hover:border-violet-500/35 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-6 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 font-extrabold text-lg text-foreground">
                <Activity className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>RAG Lab</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Experiment, analyze, and optimize chunk layouts, similarity grids, clustering spaces, and query latencies.
              </p>
            </div>
            <div className="text-[10px] text-primary font-bold font-mono tracking-wider uppercase pt-4 border-t border-border/40">
              Enter Lab Workspace &gt;
            </div>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[9px] text-muted-foreground/40 z-10 relative">
        Google DeepMind Pair Programming Session • 2026
      </footer>
    </div>
  );
}
