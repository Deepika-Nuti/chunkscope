"use client";

import React from "react";
import { FileText, Layers, Network, Search, Sparkles, BookOpen, FileCheck } from "lucide-react";

interface EmptyStateProps {
  onLoadDemo: (key: string) => void;
  isBackendOnline: boolean;
}

export default function EmptyState({ onLoadDemo, isBackendOnline }: EmptyStateProps) {
  const pipelineStages = [
    {
      id: "ingest",
      title: "1. Ingest",
      desc: "Raw document PDF/Docx/TXT/MD parsing",
      icon: FileText,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "chunk",
      title: "2. Chunk",
      desc: "Split text using paragraph/overlap separators",
      icon: Layers,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: "embed",
      title: "3. Embed",
      desc: "Map characters to high-dim vectors",
      icon: Network,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      id: "retrieve",
      title: "4. Retrieve",
      desc: "Cosine search query matching index",
      icon: Search,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  const demoDocuments = [
    { key: "research_paper.pdf", label: "Attention Research Paper", type: "PDF", desc: "Scientific model description" },
    { key: "legal_contract.pdf", label: "NDA Agreement", type: "PDF", desc: "Legal clauses and definition bounds" },
    { key: "medical_report.pdf", label: "Cardiology consult letter", type: "PDF", desc: "Complex medical reports" },
    { key: "wikipedia_article.md", label: "RAG wiki overview", type: "MD", desc: "Markdown formatted headers structure" },
    { key: "python_documentation.txt", label: "Python Decorators", type: "TXT", desc: "Code blocks separators context" },
  ];

  return (
    <div className="flex flex-col space-y-8 py-4 select-none animate-fade-in max-w-3xl mx-auto w-full">
      
      {/* Onboarding Welcome Splash Card */}
      <div className="glass-panel p-6 rounded-2xl border border-border bg-card/45 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 border border-primary/25 rounded-2xl">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-base font-extrabold text-foreground font-sans">
            Understand Document Chunking for RAG
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ChunkScope is a workspace playground where you can dissect text, visually inspect semantic coordinates, and see how chunk boundaries directly dictate LLM context retrieval.
          </p>
        </div>
      </div>

      {/* RAG pipeline path map */}
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block text-center">
          The RAG Indexing & Retrieval Pipeline
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-secondary/15 p-4 border border-border/70 rounded-2xl relative">
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div key={stg.id} className="flex flex-col items-center text-center p-3 space-y-2 relative z-10">
                <div className={`p-3 rounded-full border ${stg.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground font-sans">{stg.title}</h4>
                  <p className="text-[9.5px] text-muted-foreground leading-normal">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo library load actions grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block text-center">
          Quick Start: Load a Dataset from Demo Library
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {demoDocuments.map((demo) => (
            <button
              key={demo.key}
              onClick={() => onLoadDemo(demo.key)}
              className="p-3 border border-border bg-card hover:border-primary/50 text-left rounded-xl hover:bg-secondary/45 transition-all cursor-pointer flex items-center space-x-3 overflow-hidden group shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-secondary group-hover:bg-primary/10 group-hover:text-primary rounded-lg border border-border/80 transition-colors shrink-0">
                <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground truncate">{demo.label}</span>
                  <span className="text-[8px] bg-secondary border border-border/80 rounded px-1.5 py-0.2 font-mono text-muted-foreground uppercase shrink-0">
                    {demo.type}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate leading-normal">{demo.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!isBackendOnline && (
        <div className="text-[10.5px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start space-x-2">
          <FileCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <b>Offline Mode Active:</b> You can instantly load built-in demo files or upload TXT/MD files. Running chunk bounds and PCA vector layouts runs entirely inside your browser sandbox.
          </span>
        </div>
      )}
    </div>
  );
}
