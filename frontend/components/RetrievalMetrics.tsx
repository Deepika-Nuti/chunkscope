"use client";

import React, { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Sparkles, BarChart2, ShieldAlert } from "lucide-react";

interface RetrievalMetricsProps {
  strategy: string;
  chunkSize: number;
  chunkOverlap: number;
}

export default function RetrievalMetrics({
  strategy,
  chunkSize,
  chunkOverlap,
}: RetrievalMetricsProps) {
  // Dynamically calculate quality metrics based on strategy parameters
  const metrics = useMemo(() => {
    let coherence = 80;
    let preservation = 75;
    let score = 82;
    let confidence = 78;

    // 1. Strategy Impact
    if (strategy === "fixed") {
      coherence = 45; // Cuts words and sentences
      score = 65;
      confidence = 58;
    } else if (strategy === "recursive") {
      coherence = 92;
      score = 88;
      confidence = 86;
    } else if (strategy === "sentence") {
      coherence = 98; // Preserves complete thoughts
      score = 94;
      confidence = 92;
    } else if (strategy === "paragraph") {
      coherence = 95;
      score = 85;
      confidence = 82;
    } else if (strategy === "sliding") {
      coherence = 88;
      score = 90;
      confidence = 89;
    }

    // 2. Chunk Size Impact
    // Small chunks: precise searches (higher score), lower context (lower preservation)
    // Large chunks: lower score (irrelevant noise), higher context (preservation)
    if (chunkSize < 300) {
      score = Math.min(99, score + 8);
      preservation = Math.max(40, preservation - 20);
    } else if (chunkSize > 800) {
      score = Math.max(50, score - 15);
      preservation = Math.min(98, preservation + 15);
    }

    // 3. Overlap Impact
    // Higher overlap boosts context continuity and retrieval confidence
    if (chunkOverlap > 80) {
      preservation = Math.min(98, preservation + 8);
      confidence = Math.min(98, confidence + 6);
    } else if (chunkOverlap === 0) {
      coherence = Math.max(50, coherence - 15);
      confidence = Math.max(50, confidence - 10);
    }

    return {
      coherence: Math.round(coherence),
      preservation: Math.round(preservation),
      score: Math.round(score),
      confidence: Math.round(confidence),
    };
  }, [strategy, chunkSize, chunkOverlap]);

  const data = [
    { subject: "Coherence", value: metrics.coherence },
    { subject: "Preservation", value: metrics.preservation },
    { subject: "Retrieval Score", value: metrics.score },
    { subject: "Confidence", value: metrics.confidence },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-border bg-card/45 space-y-4 text-xs select-none">
      <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          Retrieval Diagnostics
        </span>
        <span className="inline-flex items-center text-[9px] text-emerald-400 font-mono font-bold">
          <Sparkles className="h-3 w-3 mr-1" />
          Live Metrics
        </span>
      </div>

      {/* Grid of Gauges & Progress rings */}
      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Gauge 1: Retrieval Score */}
        <div className="bg-secondary/20 p-3 border border-border/50 rounded-xl space-y-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono block">RETRIEVAL SCORE</span>
          <span className="text-lg font-extrabold text-foreground">{metrics.score}%</span>
          <div className="w-full bg-secondary h-1 rounded overflow-hidden">
            <div style={{ width: `${metrics.score}%` }} className="bg-primary h-full" />
          </div>
        </div>

        {/* Gauge 2: Context Preservation */}
        <div className="bg-secondary/20 p-3 border border-border/50 rounded-xl space-y-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono block">CONTEXT PRESERVE</span>
          <span className="text-lg font-extrabold text-foreground">{metrics.preservation}%</span>
          <div className="w-full bg-secondary h-1 rounded overflow-hidden">
            <div style={{ width: `${metrics.preservation}%` }} className="bg-primary h-full" />
          </div>
        </div>

        {/* Gauge 3: Semantic Coherence */}
        <div className="bg-secondary/20 p-3 border border-border/50 rounded-xl space-y-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono block">COHERENCE</span>
          <span className="text-lg font-extrabold text-foreground">{metrics.coherence}%</span>
          <div className="w-full bg-secondary h-1 rounded overflow-hidden">
            <div style={{ width: `${metrics.coherence}%` }} className="bg-primary h-full" />
          </div>
        </div>

        {/* Gauge 4: Confidence */}
        <div className="bg-secondary/20 p-3 border border-border/50 rounded-xl space-y-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono block">CONFIDENCE</span>
          <span className="text-lg font-extrabold text-foreground">{metrics.confidence}%</span>
          <div className="w-full bg-secondary h-1 rounded overflow-hidden">
            <div style={{ width: `${metrics.confidence}%` }} className="bg-primary h-full" />
          </div>
        </div>
      </div>

      {/* Radar Chart Visualizer */}
      <div className="h-[180px] w-full flex items-center justify-center pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#3f3f46" strokeWidth={0.5} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "#a1a1aa", fontSize: 8, fontWeight: "bold", fontFamily: "monospace" }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: "#52525b", fontSize: 6 }} 
            />
            <Radar
              name="Metrics"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Advice box */}
      <div className="p-3 bg-secondary/10 border border-border/50 rounded-xl text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5">
        <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          {metrics.score > 85
            ? "Ideal configuration! Fast semantic query matching with balanced paragraph splits."
            : "Coherence is compromised. Try increasing chunk size or switching to sentence splits."}
        </p>
      </div>
    </div>
  );
}
