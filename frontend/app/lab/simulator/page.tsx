"use client";

import React from "react";
import PipelineSimulator from "../../../components/PipelineSimulator";
import { Sparkles, Terminal } from "lucide-react";

export default function LabSimulatorPage() {
  return (
    <div className="flex-1 w-full max-w-[70rem] mx-auto p-6 flex flex-col space-y-6 min-h-0 overflow-y-auto scrollbar-thin">
      
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-[10px] text-primary font-semibold uppercase tracking-wider">
          <Terminal className="h-4 w-4 text-primary" />
          <span>Interactive Diagnostics</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          RAG Pipeline Flow Simulator
        </h1>
        <p className="text-xs text-muted-foreground">
          Analyze latency, vector movement, and LLM context prompt construction step-by-step.
        </p>
      </div>

      <PipelineSimulator />
    </div>
  );
}
