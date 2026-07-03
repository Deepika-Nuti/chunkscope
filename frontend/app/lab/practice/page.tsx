"use client";

import React from "react";
import PracticeLab from "../../../components/PracticeLab";
import { Trophy, HelpCircle } from "lucide-react";

export default function LabPracticePage() {
  return (
    <div className="flex-1 w-full max-w-[70rem] mx-auto p-6 flex flex-col space-y-6 min-h-0 overflow-y-auto scrollbar-thin">
      
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-[10px] text-primary font-semibold uppercase tracking-wider">
          <Trophy className="h-4 w-4 text-primary animate-pulse" />
          <span>Interactive Challenges</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Chunking Optimization Arena
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure chunk sizes and strategy parameters for specialized documents. Achieve target benchmarks to earn XP.
        </p>
      </div>

      <PracticeLab />
    </div>
  );
}
