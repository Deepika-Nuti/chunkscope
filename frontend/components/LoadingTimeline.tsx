"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Play } from "lucide-react";

interface LoadingTimelineProps {
  isUploading: boolean;
  isProcessing: boolean;
  isSemanticLoading: boolean;
  hasDocument: boolean;
  hasChunks: boolean;
  hasEmbeddings: boolean;
}

export default function LoadingTimeline({
  isUploading,
  isProcessing,
  isSemanticLoading,
  hasDocument,
  hasChunks,
  hasEmbeddings,
}: LoadingTimelineProps) {
  
  const steps = [
    {
      id: "upload",
      label: "Uploading Document",
      isActive: isUploading,
      isCompleted: hasDocument && !isUploading,
    },
    {
      id: "chunking",
      label: "Extracting Text & Segmenting Chunks",
      isActive: isProcessing,
      isCompleted: hasChunks && !isProcessing,
    },
    {
      id: "embeddings",
      label: "Generating Vector Embeddings",
      isActive: isSemanticLoading,
      isCompleted: hasEmbeddings && !isSemanticLoading,
    },
    {
      id: "projection",
      label: "Projecting 2D Coordinate Workspace",
      isActive: isSemanticLoading,
      isCompleted: hasEmbeddings && !isSemanticLoading,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border bg-card/50 max-w-sm w-full mx-auto space-y-5 select-none shadow-xl">
      <div className="text-center space-y-1.5 pb-2 border-b border-border/40">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
          RAG Pipeline Workspace Initialization
        </span>
        <h3 className="text-xs font-bold text-muted-foreground">
          Building index database...
        </h3>
      </div>

      <div className="space-y-4">
        {steps.map((st, idx) => {
          let statusColor = "text-muted-foreground/35 border-zinc-800 bg-zinc-900/10";
          let icon = <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />;

          if (st.isCompleted) {
            statusColor = "text-emerald-400 border-emerald-500/25 bg-emerald-500/5 font-semibold";
            icon = <Check className="h-3 w-3 text-emerald-400" />;
          } else if (st.isActive) {
            statusColor = "text-primary border-primary/25 bg-primary/5 font-bold animate-pulse";
            icon = <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
          }

          return (
            <motion.div
              key={st.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center space-x-3 p-3 border rounded-xl transition-all ${statusColor}`}
            >
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border border-current">
                {icon}
              </div>
              <span className="text-xs">{st.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="text-[9.5px] text-muted-foreground/60 text-center pt-2 leading-relaxed">
        Calculations are processed on local CPU/GPU vectors. Large documents may take several seconds.
      </div>
    </div>
  );
}
