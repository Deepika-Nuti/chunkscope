"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface LearningJourneyProps {
  currentStep: number;
  hasDocument: boolean;
  onSelectStep?: (step: number) => void;
}

interface JourneyStage {
  id: number;
  label: string;
  description: string;
}

const STAGES: JourneyStage[] = [
  { id: 1, label: "1. Upload Document", description: "Ingest target text sources" },
  { id: 2, label: "2. Choose Strategy", description: "Select split algorithms" },
  { id: 3, label: "3. Configure Parameters", description: "Fine-tune sizing & overlap" },
  { id: 4, label: "4. Watch Chunking Live", description: "Observe splits & overlaps" },
  { id: 5, label: "5. Semantic Embeddings", description: "Map meaning to 2D vector space" },
  { id: 6, label: "6. Inspect Similarity", description: "Measure HNSW nearest neighbors" },
  { id: 7, label: "7. Export RAG Index", description: "Download processed JSON dataset" },
];

export default function LearningJourney({ currentStep, hasDocument, onSelectStep }: LearningJourneyProps) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-border bg-card/45 space-y-3.5">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Your Learning Progress
      </h4>

      <div className="space-y-3 font-sans text-xs">
        {STAGES.map((stage) => {
          const isDone = stage.id < currentStep || (stage.id === 1 && hasDocument);
          const isCurrent = stage.id === currentStep;
          const isClickable = hasDocument || stage.id === 1;

          return (
            <div
              key={stage.id}
              onClick={() => {
                if (isClickable && onSelectStep) {
                  onSelectStep(stage.id);
                }
              }}
              className={`flex items-start space-x-2.5 transition-all duration-200 ${
                isClickable ? "cursor-pointer hover:translate-x-0.5" : "cursor-not-allowed"
              } ${
                isCurrent 
                  ? "text-primary scale-[1.02] font-semibold" 
                  : isDone
                  ? "text-muted-foreground/80"
                  : "text-muted-foreground/40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500/10" />
                ) : (
                  <Circle className={`h-4.5 w-4.5 ${isCurrent ? "text-primary stroke-[2px]" : "text-muted-foreground/30"}`} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11.5px] leading-tight">{stage.label}</span>
                <span className="text-[9.5px] text-muted-foreground/60 leading-normal font-medium">
                  {stage.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
