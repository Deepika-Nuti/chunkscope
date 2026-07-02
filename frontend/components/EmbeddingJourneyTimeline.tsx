"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Cpu, Settings, Shuffle, HelpCircle, Layers, Link2, Sparkles, Milestone } from "lucide-react";

interface EmbeddingJourneyTimelineProps {
  isLearningMode: boolean;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

interface StepDetails {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  what: string;
  why: string;
  outputName: string;
  outputPreview: string;
}

const JOURNEY_STEPS: StepDetails[] = [
  {
    id: 0,
    title: "Document Ingestion",
    subtitle: "Parsing raw formats",
    icon: <FileText className="h-4 w-4" />,
    what: "Retrieves characters, spaces, and paragraphs from formats like PDF, DOCX, or text.",
    why: "LLMs require raw character strings before any mathematical processing can occur.",
    outputName: "Ingested Payload",
    outputPreview: "Attention Is All You Need (Abstract & Introduction)..."
  },
  {
    id: 1,
    title: "Document Chunking",
    subtitle: "Boundary segmenting",
    icon: <Shuffle className="h-4 w-4" />,
    what: "Slices text strings into manageable sub-passages using fixed lengths or layout rules (recursive paragraph checks).",
    why: "Prevents exceeding LLM context windows, limits token costs, and avoids 'lost in the middle' retrieval errors.",
    outputName: "Segment Nodes",
    outputPreview: "Chunk #0: Character range 0 to 500, Chars count: 500, Overlap: 0c."
  },
  {
    id: 2,
    title: "Tokenization",
    subtitle: "Text to integer mappings",
    icon: <Settings className="h-4 w-4" />,
    what: "Splits chunk strings into sub-word byte pairs (BPE) and translates them into an array of integers using a tokenizer (e.g. tiktoken/cl100k).",
    why: "Neural models cannot read words; they process numerical integer IDs corresponding to vocabulary arrays.",
    outputName: "Token Vector",
    outputPreview: "[12543, 856, 45, 9812, 1024, 76, 5293, ...]"
  },
  {
    id: 3,
    title: "Transformer Encoding",
    subtitle: "High-dimensional embeddings",
    icon: <Cpu className="h-4 w-4" />,
    what: "Passes token arrays through a pre-trained Transformer (like MiniLM) to output a dense floating-point vector (dimensions size 384 or 768).",
    why: "Calculates semantic weights. Dimensions capture aspects like gender, intent, topic, tense, and formality.",
    outputName: "Dense Embedding (384d)",
    outputPreview: "[0.1245, -0.5482, 0.3329, 0.0891, -0.1147, ...]"
  },
  {
    id: 4,
    title: "Dimensionality Projection",
    subtitle: "Reducing dimensions to 2D/3D",
    icon: <Layers className="h-4 w-4" />,
    what: "Projects 384-dimensional coordinates down to 2D coordinates [x, y] using algorithms like PCA, t-SNE, or UMAP.",
    why: "Enables human visualization of abstract math. Compresses dimensions while keeping close neighbors adjacent.",
    outputName: "PCA coordinates",
    outputPreview: "Coordinates: { x: 0.428, y: -0.512 }"
  },
  {
    id: 5,
    title: "Semantic Clustering",
    subtitle: "Emergent topic groupings",
    icon: <Milestone className="h-4 w-4" />,
    what: "Clusters similar 2D points into groups (KMeans, DBSCAN) and parses keywords to label them (e.g. 'NDA & Covenants').",
    why: "Organizes the database structure and highlights thematic relationships across segments.",
    outputName: "Topic Cluster",
    outputPreview: "Cluster #1: 'Attention & Transformer' (Cohesion: 96%)"
  },
  {
    id: 6,
    title: "Similarity & Retrieval",
    subtitle: "Nearest neighbor mapping",
    icon: <Link2 className="h-4 w-4" />,
    what: "Queries vectors using cosine dot products or Euclidean distance to compile top matching context passages.",
    why: "RAG search maps queries to database chunks based on meaning, rather than simple exact keyword syntax matching.",
    outputName: "Similarity Score",
    outputPreview: "Top Match: Chunk #7 (Similarity: 94%, Distance: 0.32)"
  }
];

export default function EmbeddingJourneyTimeline({
  isLearningMode,
  activeStep,
  setActiveStep,
}: EmbeddingJourneyTimelineProps) {
  const currentStep = JOURNEY_STEPS[activeStep];

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span>RAG Semantic Embedding Stepper Journey</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Step {activeStep + 1} of 7
        </span>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Click through the pipeline stepper below to watch how a raw paragraph converts into a mathematical coordinate, and how it is grouped for vector searches.
          </span>
        </p>
      )}

      {/* Stepper bubbles row */}
      <div className="flex justify-between items-center relative py-2 overflow-x-auto scrollbar-none">
        {/* Horizontal connect line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border/40 z-0" />
        
        {JOURNEY_STEPS.map((step) => {
          const isCompleted = step.id < activeStep;
          const isActive = step.id === activeStep;
          
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative z-10 p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center h-9 w-9 shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary scale-110 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  : isCompleted
                  ? "bg-secondary text-primary border-primary/45"
                  : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
              }`}
              title={step.title}
            >
              {step.icon}
            </button>
          );
        })}
      </div>

      {/* active step display details card */}
      <div className="bg-secondary/20 p-4 rounded-xl border border-border/80 min-h-[160px] flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-primary/10 border border-primary/20 text-primary-foreground px-2 py-0.5 rounded">
              STEP #{currentStep.id + 1}
            </span>
            <h4 className="font-extrabold text-sm text-foreground">{currentStep.title}</h4>
          </div>
          <p className="text-[10.5px] text-muted-foreground italic">{currentStep.subtitle}</p>
        </div>

        {/* Breakdown grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="font-bold text-foreground block text-[10px] uppercase">What happens?</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{currentStep.what}</p>
            </div>
            <div>
              <span className="font-bold text-primary block text-[10px] uppercase">Why do it?</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{currentStep.why}</p>
            </div>
          </div>

          {/* Simulated intermediate data output */}
          <div className="bg-secondary/40 border border-border/80 p-3 rounded-lg flex flex-col justify-between min-h-[90px]">
            <div className="flex justify-between items-center border-b border-border/50 pb-1 mb-1.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">{currentStep.outputName}</span>
              <span className="text-[8px] bg-background border border-border px-1.5 py-0.2 rounded font-mono text-[7px] text-muted-foreground">
                PREVIEW
              </span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground break-all whitespace-pre-wrap flex-1 leading-normal italic select-all">
              {currentStep.outputPreview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
