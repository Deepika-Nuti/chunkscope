"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Network, RefreshCw, Layers, Sliders, Milestone } from "lucide-react";

import EmbeddingViewer from "../../../components/EmbeddingViewer";
import EmbeddingInspector from "../../../components/EmbeddingInspector";
import SimilarityExplorer from "../../../components/SimilarityExplorer";
import ClusterExplorer from "../../../components/ClusterExplorer";
import SemanticHeatmap from "../../../components/SemanticHeatmap";
import EmbeddingComparisonPanel from "../../../components/EmbeddingComparisonPanel";
import SemanticExplanationPanel from "../../../components/SemanticExplanationPanel";
import SemanticNeighborhood from "../../../components/SemanticNeighborhood";

import { generateSemanticWorkspace } from "../../../lib/api";
import { EmbeddedChunk, SemanticEdge } from "../../../lib/semantic-fallback";

export default function LabEmbeddingsPage() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [embeddingModel, setEmbeddingModel] = useState<string>("all-MiniLM-L6-v2");
  const [projectionMethod, setProjectionMethod] = useState<string>("pca");
  const [clusteringMethod, setClusteringMethod] = useState<string>("kmeans");
  const [kClustersSetting, setKClustersSetting] = useState<number>(3);

  const [embeddedChunks, setEmbeddedChunks] = useState<EmbeddedChunk[]>([]);
  const [semanticEdges, setSemanticEdges] = useState<SemanticEdge[]>([]);
  const [semanticMetrics, setSemanticMetrics] = useState<any>(null);
  const [isSemanticLoading, setIsSemanticLoading] = useState<boolean>(false);

  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);
  const [hoveredChunkId, setHoveredChunkId] = useState<number | null>(null);
  const [activeSemanticSubTab, setActiveSemanticSubTab] = useState<"inspector" | "neighbors" | "clustering" | "compare">("inspector");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"controls" | "analysis">("controls");

  useEffect(() => {
    // Cardiology & NDA preloaded templates
    const mockChunks = [
      { id: 0, text: "Cardiology Consult - Patient Deepika. Chief Complaint: Atypical chest pain occurs on exertion." },
      { id: 1, text: "Assessment & Plan: Optimize medical management. Initiate Lipitor 40 mg at bedtime." },
      { id: 2, text: "Referral: Schedule elective cardiac catheterization to assess coronary anatomy." },
      { id: 3, text: "NDA Mutual Agreement. Recipient agrees to hold Proprietary Info in strict confidence." },
      { id: 4, text: "Obligations of non-disclosure shall survive termination of this written agreement." },
      { id: 5, text: "Discloser warrants they own copyrights. Recipient agrees not to copy source files." }
    ];

    setChunks(mockChunks);
  }, []);

  useEffect(() => {
    if (chunks.length === 0) return;
    setIsSemanticLoading(true);
    generateSemanticWorkspace(
      chunks,
      embeddingModel,
      projectionMethod,
      clusteringMethod,
      kClustersSetting
    )
      .then((res) => {
        setEmbeddedChunks(res.chunks);
        setSemanticEdges(res.edges);
        setSemanticMetrics(res.metrics);
        if (selectedChunkId === null && res.chunks.length > 0) {
          setSelectedChunkId(parseInt(res.chunks[0].id));
        }
      })
      .finally(() => {
        setIsSemanticLoading(false);
      });
  }, [chunks, embeddingModel, projectionMethod, clusteringMethod, kClustersSetting]);

  const activeEmbeddedChunk = useMemo(() => {
    if (selectedChunkId === null || embeddedChunks.length === 0) return null;
    return embeddedChunks.find((c) => parseInt(c.id) === selectedChunkId) || null;
  }, [embeddedChunks, selectedChunkId]);

  return (
    <div className="flex-1 w-full max-w-[95rem] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
      
      {/* ========================================== */}
      {/* COLUMN 1: SIDEBAR (Left 25%) -> 3 of 12     */}
      {/* ========================================== */}
      <section className="lg:col-span-3 h-full overflow-y-auto pr-1 flex flex-col space-y-6 scrollbar-thin pb-6 border-r border-border/40">
        
        {/* Toggleable Tabs header */}
        <div className="flex space-x-1 p-0.5 bg-secondary/40 border border-border rounded-lg text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveSidebarTab("controls")}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer transition-all ${
              activeSidebarTab === "controls"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveSidebarTab("analysis")}
            disabled={embeddedChunks.length === 0}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer transition-all ${
              embeddedChunks.length === 0 ? "opacity-40 cursor-not-allowed" : ""
            } ${
              activeSidebarTab === "analysis"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analysis
          </button>
        </div>

        {/* Tab 1: Parameter Configurations */}
        {activeSidebarTab === "controls" && (
          <div className="glass-panel p-5 rounded-xl border border-border bg-card/45 space-y-4 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Embedding Parameters
            </span>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <span className="font-semibold text-muted-foreground">Select Model</span>
              <select
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg p-2 outline-none text-foreground cursor-pointer font-mono"
              >
                <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (384d)</option>
                <option value="all-mpnet-base-v2">all-mpnet-base-v2 (768d)</option>
              </select>
            </div>

            {/* Projections Selection */}
            <div className="space-y-1.5">
              <span className="font-semibold text-muted-foreground">Project Coordinates</span>
              <select
                value={projectionMethod}
                onChange={(e) => setProjectionMethod(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg p-2 outline-none text-foreground cursor-pointer font-mono"
              >
                <option value="pca">PCA (Linear SVD)</option>
                <option value="tsne">t-SNE (Local Manifold)</option>
                <option value="umap">UMAP (Topology Map)</option>
              </select>
            </div>

            {/* Clustering Selection */}
            <div className="space-y-1.5">
              <span className="font-semibold text-muted-foreground">Clustering Split</span>
              <select
                value={clusteringMethod}
                onChange={(e) => setClusteringMethod(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg p-2 outline-none text-foreground cursor-pointer font-mono"
              >
                <option value="kmeans">K-Means Centroids</option>
                <option value="dbscan">DBSCAN Density-based</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Vectors Sub-inspectors */}
        {activeSidebarTab === "analysis" && embeddedChunks.length > 0 && (
          <div className="space-y-5">
            {/* Sub Tabs Link */}
            <div className="flex space-x-1 p-0.5 bg-secondary/40 border border-border rounded-lg text-[9px] font-semibold">
              {[
                { id: "inspector", label: "Vector Specs" },
                { id: "neighbors", label: "Neighbors" },
                { id: "clustering", label: "Clustering" },
                { id: "compare", label: "Compare Pairs" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSemanticSubTab(sub.id as any)}
                  className={`flex-1 py-1.5 rounded font-bold cursor-pointer text-center transition-all ${
                    activeSemanticSubTab === sub.id
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab view render */}
            <div className="space-y-5">
              {activeSemanticSubTab === "inspector" && (
                <>
                  <EmbeddingInspector
                    chunk={activeEmbeddedChunk}
                    strategy="recursive"
                    onNavigate={(id) => setSelectedChunkId(id)}
                    chunksCount={embeddedChunks.length}
                  />
                  <EmbeddingComparisonPanel isLearningMode={false} />
                </>
              )}

              {activeSemanticSubTab === "neighbors" && (
                <>
                  <SemanticNeighborhood
                    selectedChunk={activeEmbeddedChunk}
                    allChunks={embeddedChunks}
                    onSelectChunk={(id) => setSelectedChunkId(id)}
                    isLearningMode={false}
                  />
                  <SimilarityExplorer
                    selectedChunk={activeEmbeddedChunk}
                    allChunks={embeddedChunks}
                    onSelectChunk={(id) => setSelectedChunkId(id)}
                    isLearningMode={false}
                  />
                </>
              )}

              {activeSemanticSubTab === "clustering" && (
                <ClusterExplorer
                  chunks={embeddedChunks}
                  clusteringMethod={clusteringMethod}
                  setClusteringMethod={setClusteringMethod}
                  kClustersSetting={kClustersSetting}
                  setKClustersSetting={setKClustersSetting}
                  metrics={semanticMetrics}
                  isLearningMode={false}
                  onSelectChunk={(id) => setSelectedChunkId(id)}
                />
              )}

              {activeSemanticSubTab === "compare" && (
                <SemanticExplanationPanel
                  chunks={embeddedChunks}
                  isLearningMode={false}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* COLUMN 2: WORKSPACE (Center 75%) -> 9 of 12 */}
      {/* ========================================== */}
      <section className="lg:col-span-9 h-full overflow-y-auto px-1 flex flex-col space-y-6 scrollbar-thin pb-6 position-sticky">
        {isSemanticLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground bg-card/25 border border-border border-dashed rounded-2xl animate-pulse">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
            <span>Calculating semantic coordinates...</span>
          </div>
        ) : embeddedChunks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground bg-[#0a0a0c]/40 border border-border/80 rounded-2xl">
            <span>No data nodes catalogued. Upload a document or switch parameters.</span>
          </div>
        ) : (
          <div className="space-y-6">
            <EmbeddingViewer
              chunks={embeddedChunks}
              edges={semanticEdges}
              projectionMethod={projectionMethod}
              setProjectionMethod={setProjectionMethod}
              selectedChunkId={selectedChunkId}
              setSelectedChunkId={setSelectedChunkId}
              hoveredChunkId={hoveredChunkId}
              setHoveredChunkId={setHoveredChunkId}
              isLearningMode={false}
            />

            <SemanticHeatmap
              chunks={embeddedChunks}
              isLearningMode={false}
            />
          </div>
        )}
      </section>
    </div>
  );
}
