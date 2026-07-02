"use client";

import React, { useMemo } from "react";
import { EmbeddedChunk } from "../lib/semantic-fallback";
import { Milestone, HelpCircle, Layers, Award, Shield, AlertTriangle } from "lucide-react";

interface ClusterExplorerProps {
  chunks: EmbeddedChunk[];
  clusteringMethod: string;
  setClusteringMethod: (method: string) => void;
  kClustersSetting: number;
  setKClustersSetting: (k: number) => void;
  metrics: {
    avgSimilarity: number;
    entropy: number;
    cohesion: number;
    separation: number;
  } | null;
  isLearningMode: boolean;
  onSelectChunk: (id: number) => void;
}

export default function ClusterExplorer({
  chunks,
  clusteringMethod,
  setClusteringMethod,
  kClustersSetting,
  setKClustersSetting,
  metrics,
  isLearningMode,
  onSelectChunk,
}: ClusterExplorerProps) {
  // Aggregate chunks by cluster label
  const clustersList = useMemo(() => {
    const groups: Record<number, { id: number; topic: string; memberIds: number[] }> = {};
    
    chunks.forEach((c) => {
      const lbl = c.cluster !== undefined ? c.cluster : 0;
      if (!groups[lbl]) {
        groups[lbl] = {
          id: lbl,
          topic: c.semanticTopic || "Topic Group",
          memberIds: [],
        };
      }
      groups[lbl].memberIds.push(parseInt(c.id));
    });

    return Object.values(groups).sort((a, b) => a.id - b.id);
  }, [chunks]);

  return (
    <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap justify-between items-center pb-2 border-b border-border gap-3">
        <span className="text-xs font-semibold flex items-center space-x-1.5">
          <Milestone className="h-4 w-4 text-violet-400" />
          <span>Semantic Cluster Analyzer</span>
        </span>

        <div className="flex items-center space-x-3 text-[10px]">
          {/* Method selector */}
          <div className="flex items-center space-x-1 border border-border bg-secondary/30 p-0.5 rounded-md">
            {["KMeans", "DBSCAN"].map((method) => {
              const isActive = clusteringMethod.toLowerCase() === method.toLowerCase();
              return (
                <button
                  key={method}
                  onClick={() => setClusteringMethod(method.toLowerCase())}
                  className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                    isActive ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>

          {/* K clusters slider for KMeans */}
          {clusteringMethod === "kmeans" && (
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground font-semibold">K:</span>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={kClustersSetting}
                onChange={(e) => setKClustersSetting(parseInt(e.target.value))}
                className="w-16 h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
              />
              <span className="font-bold text-primary font-mono">{kClustersSetting}</span>
            </div>
          )}
        </div>
      </div>

      {isLearningMode && (
        <p className="text-[10px] text-muted-foreground leading-normal flex items-start space-x-1.5 bg-secondary/35 p-2 rounded-lg border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Clustering groups vectors automatically using mathematical coordinates. <b>Cohesion</b> evaluates density inside clusters, while <b>Separation</b> evaluates topic boundaries. High <b>Entropy</b> means chunks are distributed diversely.
          </span>
        </p>
      )}

      {/* Global metrics grid cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-secondary/25 border border-border/60 p-2.5 rounded-lg flex flex-col justify-between">
            <span className="text-muted-foreground text-[8px] font-sans">COHESION (INTRA)</span>
            <span className="font-bold text-emerald-400 mt-1">{metrics.cohesion}</span>
          </div>
          <div className="bg-secondary/25 border border-border/60 p-2.5 rounded-lg flex flex-col justify-between">
            <span className="text-muted-foreground text-[8px] font-sans">SEPARATION (INTER)</span>
            <span className="font-bold text-emerald-400 mt-1">{metrics.separation}</span>
          </div>
          <div className="bg-secondary/25 border border-border/60 p-2.5 rounded-lg flex flex-col justify-between">
            <span className="text-muted-foreground text-[8px] font-sans">SEMANTIC ENTROPY</span>
            <span className="font-bold text-indigo-400 mt-1">{metrics.entropy}</span>
          </div>
          <div className="bg-secondary/25 border border-border/60 p-2.5 rounded-lg flex flex-col justify-between">
            <span className="text-muted-foreground text-[8px] font-sans">CLUSTERS DETECTED</span>
            <span className="font-bold text-foreground mt-1">{clustersList.length} clusters</span>
          </div>
        </div>
      )}

      {/* Clusters cards breakdown */}
      <div className="space-y-3">
        {clustersList.map((cluster) => {
          const isOutlier = cluster.id === -1;
          const displayLabel = isOutlier ? "Outliers / Noise" : `Cluster #${cluster.id}`;
          const borderClass = isOutlier ? "border-rose-500/20 bg-rose-500/5" : "border-border bg-secondary/15";

          return (
            <div
              key={cluster.id}
              className={`p-4 border rounded-xl space-y-2 text-xs transition-all hover:border-primary/25 ${borderClass}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-foreground">{displayLabel}</span>
                  <span className="text-[10px] text-primary font-semibold font-mono bg-background border border-border px-1.5 py-0.2 rounded-full">
                    {cluster.memberIds.length} chunks
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold italic truncate max-w-44">
                  {cluster.topic}
                </span>
              </div>

              {/* Cluster member nodes pills */}
              <div className="flex flex-wrap gap-1">
                {cluster.memberIds.map((memberId) => (
                  <button
                    key={memberId}
                    onClick={() => onSelectChunk(memberId)}
                    className="px-2 py-0.5 bg-background hover:bg-secondary border border-border hover:border-primary/45 rounded font-mono text-[9px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all shrink-0"
                  >
                    #{memberId}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
