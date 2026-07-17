"use client";

import React from "react";
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, Lightbulb } from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  guideText: string;
  bullets: string[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Step 1: Load Document Source",
    guideText: "Every RAG system begins with raw text ingestion. Upload a file or load an instant demo text in the Left column to analyze stats:",
    bullets: [
      "File Uploader: Parse PDF, DOCX, TXT, or MD files instantly.",
      "Demo Library: Ingest MUTUAL NDA or Attention Research paper to test features."
    ]
  },
  {
    id: 2,
    title: "Step 2: Choose Chunking Strategy",
    guideText: "Select the split logic rule determining how the document's continuous text stream is divided:",
    bullets: [
      "Fixed / Recursive: Splits by character limits, attempting to keep paragraphs or sentences together first.",
      "Sentence / Paragraph: Cuts text strictly along grammatical boundary markers."
    ]
  },
  {
    id: 3,
    title: "Step 3: Fine-Tune Sizing & Overlap",
    guideText: "Fine-tune sliders to control context sizes and prevent semantic fragmentation:",
    bullets: [
      "Chunk Size: Limits maximum characters per chunk to prevent prompt context diluting.",
      "Chunk Overlap: Copies text at slice boundaries so transition facts aren't lost."
    ]
  },
  {
    id: 4,
    title: "Step 4: Watch Chunking Live",
    guideText: "Analyze the split blocks rendered in the Live Visualizer. Click slices to see indices:",
    bullets: [
      "Scan Line: See how the chunking engine parses text segments sequentially.",
      "Overlap Indicators: Striped bands highlight boundary characters duplicated across chunks."
    ]
  },
  {
    id: 5,
    title: "Step 5: Inspect Semantic Embeddings",
    guideText: "Navigate to the 'Semantic Space' tab to project document slices as vector points:",
    bullets: [
      "2D Scatter Map: PCA, t-SNE, and UMAP algorithms coordinate semantic positions.",
      "Semantic Clusters: Chunks sharing topic groups cluster together automatically."
    ]
  },
  {
    id: 6,
    title: "Step 6: Navigate Neighbor Similarity",
    guideText: "Explore neighbors and query indexing connections stored in vector databases:",
    bullets: [
      "HNSW Edges: White lines trace neighbor paths vector search engines traverse.",
      "Cluster Metrics: Measure Semantic Cohesion ratings and density spreads."
    ]
  },
  {
    id: 7,
    title: "Step 7: Export RAG Vector Index",
    guideText: "Download the compiled chunk index data structure to integrate with vector databases:",
    bullets: [
      "JSON Export: Downloads chunk IDs, characters ranges, token sizes, and vector coords.",
      "Vector DB Ready: Instantly loadable into Chroma, Pinecone, or pgvector indexes."
    ]
  }
];

interface GuidedLearningWizardProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  strategy: string;
}

export default function GuidedLearningWizard({
  currentStep,
  setCurrentStep,
  strategy,
}: GuidedLearningWizardProps) {
  const stepIdx = Math.max(0, Math.min(WIZARD_STEPS.length - 1, currentStep - 1));
  const activeStep = WIZARD_STEPS[stepIdx];

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReplay = () => {
    setCurrentStep(1);
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-violet-500/5 border border-primary/30 p-5 rounded-2xl space-y-4 shadow-xl shadow-primary/5 select-none relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <span className="text-[10px] font-extrabold tracking-wider text-primary uppercase flex items-center space-x-1.5">
          <Lightbulb className="h-4 w-4 text-amber-400 fill-amber-400/20" />
          <span>Interactive RAG Tutorial Guide</span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Step {currentStep} of {WIZARD_STEPS.length}
        </span>
      </div>

      {/* Main explanation text */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-foreground flex items-center space-x-2">
          <span>{activeStep.title}</span>
        </h3>
        
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          {activeStep.guideText}
        </p>

        {/* Dynamic bullet descriptions */}
        <div className="space-y-2 pl-1.5">
          {activeStep.bullets.map((bullet, idx) => {
            const parts = bullet.split(":");
            return (
              <div key={idx} className="flex items-start space-x-2 text-[10.5px]">
                <span className="text-primary font-bold mt-0.5">✓</span>
                <span className="text-muted-foreground/80 leading-normal">
                  <b className="text-foreground font-semibold">{parts[0]}:</b>
                  {parts[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action controls row */}
      <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[10.5px]">
        <button
          onClick={handleReplay}
          className="flex items-center space-x-1 hover:text-foreground text-muted-foreground/60 transition-all cursor-pointer font-semibold"
          title="Restart tutorial"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="flex items-center space-x-1 hover:text-foreground text-muted-foreground transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          
          <button
            disabled={currentStep === WIZARD_STEPS.length}
            onClick={handleNext}
            className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/80 transition-all px-3 py-1 rounded-lg cursor-pointer flex items-center space-x-1 disabled:opacity-20 disabled:cursor-not-allowed font-extrabold"
          >
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
