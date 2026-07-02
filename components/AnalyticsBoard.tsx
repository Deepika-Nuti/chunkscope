"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Chunk } from "../lib/fallback-engine";
import { BarChart3, PieChart as PieIcon, TrendingUp, Cpu, Hash, FileText, Sparkles, AlertCircle, ShieldAlert } from "lucide-react";

interface AnalyticsBoardProps {
  chunks: Chunk[];
  originalTextLength: number;
  stats: {
    total_chunks: number;
    avg_chunk_size: number;
    avg_token_count: number;
    largest_chunk: number;
    smallest_chunk: number;
    processing_time_ms: number;
  } | null;
}

export default function AnalyticsBoard({ chunks, originalTextLength, stats }: AnalyticsBoardProps) {
  // 1. Calculate advanced educational metrics
  const coherenceScore = useMemo(() => {
    if (chunks.length === 0) return 0;
    let totalScore = 0;
    
    chunks.forEach((c) => {
      const text = c.text.trim();
      // Inspect boundaries
      if (c.text.endsWith("\n\n") || c.text.endsWith("\r\n\r\n")) {
        totalScore += 100; // Paragraph split: perfect
      } else if (c.text.endsWith("\n") || c.text.endsWith("\r\n")) {
        totalScore += 85;  // Newline split: very good
      } else if (/[.!?]$/.test(text)) {
        totalScore += 75;  // Sentence split: good
      } else if (/\s$/.test(c.text) || /^\s/.test(c.text)) {
        totalScore += 50;  // Word space split: mediocre
      } else {
        totalScore += 15;  // Mid-word split: extremely poor
      }
    });

    return Math.round(totalScore / chunks.length);
  }, [chunks]);

  const overlapEfficiency = useMemo(() => {
    if (chunks.length === 0) return 0;
    const avgChunkSize = chunks.reduce((sum, c) => sum + c.char_count, 0) / chunks.length;
    const avgOverlap = chunks.reduce((sum, c) => sum + (c.overlap_prev + c.overlap_next) / 2, 0) / chunks.length;
    
    if (avgChunkSize === 0) return 0;
    const ratio = avgOverlap / avgChunkSize;

    if (ratio === 0) return 50; // 0 overlap has 50% efficiency (extreme boundary clip risks)
    if (ratio >= 0.1 && ratio <= 0.22) return 96; // optimal range: 10% - 22%
    if (ratio < 0.1) return Math.round(50 + (ratio / 0.1) * 46); // scales up to 96
    // Bloat: overlap is too massive, wasting database size
    return Math.round(Math.max(25, 96 - ((ratio - 0.22) / 0.78) * 71));
  }, [chunks]);

  const estimatedRetrievalQuality = useMemo(() => {
    // Retrieval quality is a function of coherence, overlap buffers, and standard chunk sizing (500-1000 chars)
    const score = Math.round(coherenceScore * 0.45 + overlapEfficiency * 0.45 + 10);
    return Math.min(100, Math.max(10, score));
  }, [coherenceScore, overlapEfficiency]);

  // 2. Prepare charts data
  const chartData = useMemo(() => {
    return chunks.map((c) => ({
      name: `Chunk ${c.id}`,
      characters: c.char_count,
      tokens: c.token_count,
      overlap: c.overlap_prev + c.overlap_next,
    }));
  }, [chunks]);

  const pieData = useMemo(() => {
    if (chunks.length === 0) return [];
    const totalOverlappedChars = chunks.reduce((sum, c) => sum + c.overlap_next, 0);
    const uniqueChars = Math.max(1, originalTextLength - totalOverlappedChars);
    
    return [
      { name: "Unique Content", value: uniqueChars },
      { name: "Overlapped Content", value: totalOverlappedChars },
    ];
  }, [chunks, originalTextLength]);

  if (!stats || chunks.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground text-xs glass-panel border border-border bg-card rounded-xl">
        Upload a document and run a chunking strategy to view analytics.
      </div>
    );
  }

  // Helper to draw circular gauges
  const CircularGauge = ({ value, label, subtitle, colorClass }: { value: number; label: string; subtitle: string; colorClass: string }) => {
    const radius = 32;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="glass-panel p-4 rounded-xl border border-border bg-card/60 flex items-center space-x-4">
        {/* SVG Progress Ring */}
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-full w-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={colorClass}
            />
          </svg>
          {/* Centered value percentage */}
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs">
            {value}%
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">{label}</span>
          <span className="text-[11px] text-foreground font-semibold leading-normal block">{subtitle}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced RAG Metrics row (Gauges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CircularGauge
          value={coherenceScore}
          label="Chunk Coherence"
          subtitle={
            coherenceScore >= 80
              ? "Syntactic boundary splits are highly respected."
              : coherenceScore >= 50
              ? "Medium coherence. Thoughts are occasionally sliced."
              : "Poor coherence. Words or variables are split in half."
          }
          colorClass={coherenceScore >= 75 ? "text-emerald-400" : coherenceScore >= 50 ? "text-amber-400" : "text-rose-400"}
        />

        <CircularGauge
          value={overlapEfficiency}
          label="Overlap Efficiency"
          subtitle={
            overlapEfficiency >= 80
              ? "Optimal overlap sizing preserves context without bloat."
              : overlapEfficiency >= 50
              ? "Zero or small overlap. Risk of semantic context losses."
              : "Oversized overlaps causing vector index duplication bloats."
          }
          colorClass={overlapEfficiency >= 75 ? "text-emerald-400" : overlapEfficiency >= 50 ? "text-amber-400" : "text-rose-400"}
        />

        <CircularGauge
          value={estimatedRetrievalQuality}
          label="Retrieval Quality (Est)"
          subtitle={
            estimatedRetrievalQuality >= 80
              ? "Excellent index profile. High similarity matches predicted."
              : estimatedRetrievalQuality >= 55
              ? "Moderate index profile. Retrieval accuracy may fluctuate."
              : "Weak index. Semantic vector splits will yield high noise."
          }
          colorClass={estimatedRetrievalQuality >= 75 ? "text-indigo-400" : estimatedRetrievalQuality >= 50 ? "text-amber-400" : "text-rose-400"}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Chunks", value: stats.total_chunks, icon: Hash, color: "text-indigo-400 bg-indigo-500/10" },
          { label: "Avg Chunk Size", value: `${stats.avg_chunk_size} ch`, icon: FileText, color: "text-amber-400 bg-amber-500/10" },
          { label: "Avg Tokens", value: `~${stats.avg_token_count}`, icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Largest Chunk", value: `${stats.largest_chunk} ch`, icon: BarChart3, color: "text-purple-400 bg-purple-500/10" },
          { label: "Smallest Chunk", value: `${stats.smallest_chunk} ch`, icon: BarChart3, color: "text-rose-400 bg-rose-500/10" },
          { label: "Processing Speed", value: `${stats.processing_time_ms} ms`, icon: Cpu, color: "text-cyan-400 bg-cyan-500/10" },
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-border bg-card/60 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
              <div className={`p-1.5 rounded-lg ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-foreground leading-none">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Size Distribution */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col h-80">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold flex items-center space-x-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <span>Chunk Size & Token Distribution</span>
            </span>
          </div>
          <div className="flex-1 w-full min-h-0 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 10, 12, 0.9)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#f4f4f5",
                    fontSize: "11px",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="characters" stroke="#818cf8" fillOpacity={1} fill="url(#colorChars)" name="Characters" />
                <Area type="monotone" dataKey="tokens" stroke="#34d399" fillOpacity={1} fill="url(#colorTokens)" name="Est. Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Overlap Redundancy Ratio */}
        <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 flex flex-col h-80">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold flex items-center space-x-1.5">
              <PieIcon className="h-4 w-4 text-amber-400" />
              <span>Overlap Data Redundancy</span>
            </span>
          </div>
          <div className="flex-1 w-full min-h-0 text-[10px] flex items-center justify-center">
            {pieData[1]?.value === 0 ? (
              <div className="text-xs text-muted-foreground text-center">
                This strategy has 0 overlap redundancy (e.g. Sentence / Paragraph chunking). Excellent for storage conservation!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#818cf8" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 12, 0.9)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#f4f4f5",
                      fontSize: "11px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
