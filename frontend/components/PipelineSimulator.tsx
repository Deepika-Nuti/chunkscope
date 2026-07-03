"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, FileText, Settings, Database, Brain, Sparkles, Network, ArrowRight } from "lucide-react";

type SimStage = "idle" | "ingesting" | "chunking" | "embedding" | "indexing" | "querying" | "scoring" | "context" | "generation" | "complete";

export default function PipelineSimulator() {
  const [stage, setStage] = useState<SimStage>("idle");
  const [activeQuery, setActiveQuery] = useState("What medication was patient Deepika prescribed?");
  const [simulatedAnswer, setSimulatedAnswer] = useState("");
  const [scoreList, setScoreList] = useState<Array<{ id: number; score: number; text: string }>>([]);

  const stagesList = [
    { id: "ingesting", label: "Document Ingest", icon: FileText },
    { id: "chunking", label: "Semantic Chunking", icon: Settings },
    { id: "embedding", label: "Vector Embedding", icon: Network },
    { id: "indexing", label: "Vector Database", icon: Database },
    { id: "scoring", label: "Similarity Search", icon: Brain },
    { id: "generation", label: "Grounded Answer", icon: Sparkles }
  ];

  useEffect(() => {
    if (stage === "idle") {
      setSimulatedAnswer("");
      setScoreList([]);
      return;
    }

    if (stage === "ingesting") {
      const timer = setTimeout(() => setStage("chunking"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "chunking") {
      const timer = setTimeout(() => setStage("embedding"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "embedding") {
      const timer = setTimeout(() => setStage("indexing"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "indexing") {
      const timer = setTimeout(() => setStage("querying"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "querying") {
      const timer = setTimeout(() => {
        setScoreList([
          { id: 1, score: 0.95, text: "Initiate Atorvastatin 40 mg for Patient Deepika." },
          { id: 2, score: 0.72, text: "Patient complaints of atypical squeezing chest pain." },
          { id: 3, score: 0.12, text: "NDA Mutual Agreement. Recipient holds confidential info." }
        ]);
        setStage("scoring");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "scoring") {
      const timer = setTimeout(() => setStage("context"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "context") {
      const timer = setTimeout(() => setStage("generation"), 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "generation") {
      const fullAnswer = "Patient Deepika was prescribed Atorvastatin 40 mg for cardiology management.";
      let idx = 0;
      const interval = setInterval(() => {
        setSimulatedAnswer((prev) => prev + fullAnswer.charAt(idx));
        idx++;
        if (idx >= fullAnswer.length) {
          clearInterval(interval);
          setStage("complete");
        }
      }, 35);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleStart = () => {
    setStage("ingesting");
  };

  const handleReset = () => {
    setStage("idle");
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border bg-card/45 space-y-6 select-none relative overflow-hidden">
      
      {/* Background glow decoration */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-primary font-mono tracking-widest block uppercase">
            Interactive Simulator: Step-by-Step
          </span>
          <span className="text-xs font-semibold text-foreground">
            End-to-End RAG Retrieval pipeline flow
          </span>
        </div>

        <div className="flex space-x-2">
          {stage === "idle" || stage === "complete" ? (
            <button
              onClick={handleStart}
              className="px-3.5 py-1.5 bg-primary text-primary-foreground border border-primary/20 rounded-lg hover:bg-primary/90 font-extrabold text-[10.5px] cursor-pointer flex items-center space-x-1.5 transition-all shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run RAG Pipeline</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-secondary border border-border rounded-lg hover:bg-secondary/80 font-bold text-[10.5px] cursor-pointer flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Flow</span>
            </button>
          )}
        </div>
      </div>

      {/* Flow Storyboard Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stagesList.map((s, idx) => {
          const isActive = stage === s.id;
          const isPast = stagesList.findIndex((x) => x.id === stage) > idx || stage === "complete";
          
          return (
            <div
              key={s.id}
              className={`p-3 border rounded-xl flex flex-col justify-between items-center text-center space-y-2.5 transition-all duration-200 relative ${
                isActive 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.02]" 
                  : isPast
                  ? "border-emerald-500/60 bg-emerald-500/5 text-emerald-400"
                  : "border-border bg-secondary/15 text-muted-foreground"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive ? "bg-primary/10 text-primary animate-pulse" : isPast ? "bg-emerald-500/10 text-emerald-400" : "bg-background text-zinc-600"
              }`}>
                <s.icon className="h-4.5 w-4.5" />
              </div>
              <span className={`text-[9.5px] font-bold tracking-tight block ${isActive || isPast ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>

              {/* Connecting animated vector particles */}
              {isActive && idx < 5 && (
                <span className="absolute top-1/2 -right-2.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping hidden md:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Workspace Canvas */}
      <div className="min-h-[260px] bg-[#020203] border border-border/80 rounded-xl p-5 font-mono text-[11px] leading-relaxed text-muted-foreground flex flex-col justify-between relative overflow-hidden">
        
        {stage === "idle" && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-10">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h4 className="font-bold text-foreground">Click "Run RAG Pipeline" to start</h4>
            <p className="text-[10px] text-muted-foreground max-w-xs">
              Watch a patient document get parsed, segmented, embedded, indexed, matched, and synthesized by the LLM.
            </p>
          </div>
        )}

        {stage === "ingesting" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">INGEST MODULE</span>
            <p className="text-foreground font-sans text-xs">
              Reading file: <b className="text-primary font-mono">cardiology_consult.txt</b> (340 characters)...
            </p>
            <p className="text-muted-foreground bg-secondary/10 p-2.5 rounded border border-border/40 text-[10px]">
              "Cardiology Consult - Patient Deepika. Chief Complaint: Atypical chest pain. Assessment & Plan: Optimize medical management. Initiate Atorvastatin 40 mg..."
            </p>
          </div>
        )}

        {stage === "chunking" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">SEMANTIC CHUNKER</span>
            <p className="text-foreground font-sans text-xs">Splitting layout string into 3 coherent blocks...</p>
            <div className="space-y-1 text-[10px]">
              <div className="p-2 border border-border/60 bg-secondary/20 rounded">
                <b>Chunk #1:</b> "Cardiology Consult - Patient Deepika. Chief Complaint: Atypical chest pain."
              </div>
              <div className="p-2 border border-border/60 bg-secondary/20 rounded">
                <b>Chunk #2:</b> "Assessment & Plan: Optimize medical management. Initiate Atorvastatin 40 mg."
              </div>
            </div>
          </div>
        )}

        {stage === "embedding" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">EMBEDDING ENCODER</span>
            <p className="text-foreground font-sans text-xs">Computing sentence transformer coordinate weights...</p>
            <div className="space-y-1.5 font-mono text-[9px] bg-[#050507] p-3 rounded border border-border/40">
              <div>Chunk #1 vector: <span className="text-indigo-400 font-bold">[0.12, -0.45, 0.78, -0.02, 0.19, -0.66, ...] (384 dims)</span></div>
              <div>Chunk #2 vector: <span className="text-indigo-400 font-bold">[0.08, -0.52, 0.81, -0.06, 0.22, -0.71, ...] (384 dims)</span></div>
            </div>
          </div>
        )}

        {stage === "indexing" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">HNSW VECTOR INDEX</span>
            <p className="text-foreground font-sans text-xs">Registering embeddings in database index nodes...</p>
            <p className="text-muted-foreground text-[10px]">
              ✓ Stored 2 vector embeddings in the index graph. Database is now online and searchable.
            </p>
          </div>
        )}

        {(stage === "querying" || stage === "scoring") && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">SIMILARITY MATCH ENGINE</span>
            <p className="text-foreground font-sans text-xs">Querying: <span className="text-primary font-bold">"{activeQuery}"</span></p>
            <div className="space-y-1.5 pt-2">
              {scoreList.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded border border-border/40 text-[10px]">
                  <span className="truncate max-w-[80%]">Chunk #{item.id}: "{item.text}"</span>
                  <span className={`font-mono font-bold ${
                    item.score > 0.8 ? "text-emerald-400" : item.score > 0.5 ? "text-amber-400" : "text-zinc-600"
                  }`}>
                    Similarity: {Math.round(item.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === "context" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-primary block">LLM CONTEXT BUILDER</span>
            <p className="text-foreground font-sans text-xs">Compiling prompt context with the top matched Chunk #1...</p>
            <p className="text-zinc-400 italic bg-secondary/15 p-2 rounded border border-border/40 text-[10px]">
              "Answer patient cardiology question based on this context: [Initiate Atorvastatin 40 mg for Patient Deepika.] Question: [What medication was Deepika prescribed?]"
            </p>
          </div>
        )}

        {(stage === "generation" || stage === "complete") && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[8px] font-bold text-emerald-400 block animate-pulse">GROUNDED GENERATION</span>
            <p className="text-foreground font-sans text-xs">LLM is generating answer (grounded, no hallucination):</p>
            <div className="p-3 bg-secondary/20 border border-border/80 rounded-xl text-foreground text-xs font-sans min-h-[50px] shadow-inner">
              {simulatedAnswer}
              <span className="animate-pulse bg-primary px-0.5 ml-0.5">|</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
