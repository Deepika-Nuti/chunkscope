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
    title: "Step 1: Ingest & Select Split Strategy",
    guideText: "Every RAG system begins with text ingestion. Choose how the document should be parsed:",
    bullets: [
      "Fixed Size: Splits strictly by character indices.",
      "Recursive Character: Intelligently preserves paragraphs & sentences (Recommended).",
      "Sentence: Slices text by grammar boundaries."
    ]
  },
  {
    id: 2,
    title: "Step 2: Adjust Parameter Sliders",
    guideText: "Configure parameters to adjust context size and prevent semantic fragmentation:",
    bullets: [
      "Chunk Size: Limits how much text enters a single RAG document.",
      "Overlap: Duplicates characters between adjacent chunks so contexts aren't cut in half."
    ]
  },
  {
    id: 3,
    title: "Step 3: Observe Split Boundaries",
    guideText: "Click on any chunk in the visualizer to inspect why it was created:",
    bullets: [
      "Check the trigger conditions list in the Inspector drawer on the right.",
      "Green markers highlight characters shared between overlap boundaries."
    ]
  },
  {
    id: 4,
    title: "Step 4: Semantic Embeddings & Indexing",
    guideText: "Switch to the 'Semantic Space' tab to explore vector database organization:",
    bullets: [
      "See how chunks cluster by topic automatically (e.g., medical, legal).",
      "Compare MiniLM vs. MPNet embeddings speed and accuracy trade-offs."
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
