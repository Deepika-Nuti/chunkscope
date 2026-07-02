"use client";

import React from "react";
import { Search, Compass, MessageSquare, Play } from "lucide-react";

export default function LabRetrievalPage() {
  return (
    <div className="flex-1 w-full max-w-[95rem] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
      
      {/* Controls stub (Left 20%) */}
      <section className="lg:col-span-3 h-full overflow-y-auto pr-1 flex flex-col space-y-6 scrollbar-thin pb-6">
        <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-4 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Query Settings
          </span>
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground block">Retrieval Style</span>
            <select className="w-full bg-secondary border border-border rounded-lg p-2 outline-none text-foreground font-mono cursor-not-allowed" disabled>
              <option>Dense Vector Search</option>
              <option>Hybrid (Dense + BM25)</option>
              <option>Re-ranked (Cohort Cross-encoder)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Workspace stub (Center 55%) */}
      <section className="lg:col-span-6 h-full overflow-y-auto px-1 flex flex-col space-y-6 scrollbar-thin pb-6 justify-center items-center text-center">
        <Search className="h-12 w-12 text-primary/30 mb-3 animate-pulse" />
        <h3 className="font-bold text-sm text-foreground">Phase 4 Retrieval Workspace</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Top-K query alignment, token weight re-ranking, and response context assembler are scheduled for Phase 4 retrieval integrations.
        </p>
      </section>

      {/* Analytics stub (Right 25%) */}
      <section className="lg:col-span-3 h-full overflow-y-auto pl-1 flex flex-col space-y-6 scrollbar-thin pb-6">
        <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 text-xs text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground block mb-2 font-mono uppercase text-[9px] tracking-wider">
            Query Metrics (Est)
          </span>
          <p>MRR @ 5: --</p>
          <p>NDCG @ 10: --</p>
        </div>
      </section>
    </div>
  );
}
