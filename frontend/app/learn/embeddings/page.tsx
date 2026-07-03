"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, HelpCircle, Info, RefreshCw, Network } from "lucide-react";
import SemanticNeighborhood from "../../../components/SemanticNeighborhood";
import SemanticExplanationPanel from "../../../components/SemanticExplanationPanel";
import { generateSemanticWorkspace } from "../../../lib/api";
import { EmbeddedChunk } from "../../../lib/semantic-fallback";
import { useGamification } from "../../../lib/useGamification";

export default function LearnEmbeddingsPage() {
  const { completeLesson } = useGamification();
  const [chunks, setChunks] = useState<any[]>([]);
  const [embeddedChunks, setEmbeddedChunks] = useState<EmbeddedChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);

  useEffect(() => {
    // Aggregated mock chunks representing RAG index topics
    const mockChunks = [
      { id: 0, text: "Cardiology Consult. Patient complains of atypical chest pains squeezing on exertion." },
      { id: 1, text: "Initiate Lipitor 40 mg. Catheterization elective scheduled outpatient to assess anatomy." },
      { id: 2, text: "NDA Mutual Agreement. Recipient agrees to hold proprietary info in strict confidence." },
      { id: 3, text: "Disclosing party owns all rights. This confidentiality shall survive termination." }
    ];

    setChunks(mockChunks);
    setIsProcessing(true);
    
    // Simulate embedding workspace
    generateSemanticWorkspace(mockChunks, "all-MiniLM-L6-v2", "pca", "kmeans", 2)
      .then((res) => {
        setEmbeddedChunks(res.chunks);
        if (res.chunks.length > 0) {
          setSelectedChunkId(parseInt(res.chunks[0].id));
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });

    completeLesson("embeddings", 100);
  }, []);

  const activeEmbeddedChunk = embeddedChunks.find((c) => parseInt(c.id) === selectedChunkId) || null;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-10 px-6 space-y-12 animate-fade-in select-none">
      {/* 1. Progress Banner */}
      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-border pb-3">
        <span>Lesson 4 of 7</span>
        <span className="text-primary font-bold">Vector Embeddings</span>
      </div>

      {/* 2. Educational Question Title */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-primary animate-pulse" />
          Lesson 4: Vector Embeddings & Projections
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          How do vectors represent semantic meaning?
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          An embedding is a list of coordinate weights representing text topics. Chunks covering similar concepts sit closely grouped in vector coordinates space.
        </p>
      </div>

      {/* 3. Main Workspace Grid */}
      {isProcessing ? (
        <div className="h-96 flex flex-col items-center justify-center text-xs text-muted-foreground bg-card/25 border border-border border-dashed rounded-2xl animate-pulse">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
          <span>Calculating coordinates...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hands-On Challenge Card */}
          <div className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
            selectedChunkId === 2
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-primary bg-primary/5 text-primary"
          }`}>
            <div className="space-y-1">
              <span className="font-extrabold text-[10px] uppercase tracking-widest block font-mono">
                🎯 Hands-On Mission: Space Inspection
              </span>
              <p className="text-[11px] text-muted-foreground">
                {selectedChunkId === 2
                  ? "Success! You clicked Chunk #2 (NDA). Note how its similarity with cardiology falls to 0.12 (near zero)."
                  : "Challenge: Click on the 'Legal Agreement' node (Chunk #2) in the proximity graph to analyze coordinates."}
              </p>
            </div>
            
            {selectedChunkId === 2 && (
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase shrink-0 font-sans">
                Completed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Orbit Node Graph */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Local Proximity Projections Map
              </span>
              <SemanticNeighborhood
                selectedChunk={activeEmbeddedChunk}
                allChunks={embeddedChunks}
                onSelectChunk={(id) => setSelectedChunkId(id)}
                isLearningMode={true}
              />
            </div>

            {/* Right Side: Explain pair comparisons */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Concept Similarity Metrics
              </span>
              <SemanticExplanationPanel
                chunks={embeddedChunks}
                isLearningMode={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Sticky Explanation Panel */}
      {activeEmbeddedChunk && (
        <div className="p-5 bg-secondary/15 border border-border/80 rounded-2xl text-xs space-y-3">
          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-foreground flex items-center">
            <Info className="h-4 w-4 mr-1 text-primary animate-pulse" />
            What just happened? (Concept breakdown)
          </h4>
          <p className="text-muted-foreground text-[11.5px] leading-relaxed">
            By analyzing the text of cardiology files and NDA terms, the machine model computes high dimensional coordinates. When projected into 2D, they split into two clear clusters: **Medical Consult** (Chunks #0 and #1) and **Confidentiality Agreements** (Chunks #2 and #3). When a user queries "chest pain", similarity logic matches the medical coordinate pool, ignoring the NDA.
          </p>
        </div>
      )}

      {/* 5. Navigation Row */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/learn/overlap"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lesson 3</span>
        </Link>

        <Link
          href="/learn/vector-db"
          className="bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/85 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold flex items-center space-x-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <span>Continue to Lesson 5: Vector DB</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
