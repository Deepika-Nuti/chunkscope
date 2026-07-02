"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Settings,
  Activity,
  BarChart2,
  Sparkles,
  Terminal,
  Grid,
  RefreshCw,
  Info
} from "lucide-react";

import DocumentUpload from "../../../components/DocumentUpload";
import StrategyCard from "../../../components/StrategyCard";
import ParameterPanel from "../../../components/ParameterPanel";
import LiveVisualizer from "../../../components/LiveVisualizer";
import AnalyticsBoard from "../../../components/AnalyticsBoard";
import ChunkTimeline from "../../../components/ChunkTimeline";
import CompareStrategies from "../../../components/CompareStrategies";
import ChunkInspector from "../../../components/ChunkInspector";

import { FileMetadata, chunkText, checkBackendHealth } from "../../../lib/api";
import { Chunk, ChunkParams } from "../../../lib/fallback-engine";

export default function LabChunkingPage() {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState<FileMetadata | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"controls" | "analysis">("controls");
  
  // Strategy params
  const [strategy, setStrategy] = useState<string>("recursive");
  const [params, setParams] = useState<ChunkParams>({
    chunk_size: 500,
    chunk_overlap: 100,
    sentences_per_chunk: 3,
    paragraphs_per_chunk: 1,
    window_size: 100,
    stride: 50,
  });

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);

  // Parameter change "What Just Happened?" tracking states
  const [paramDiffReport, setParamDiffReport] = useState<{
    sizeDiff: string;
    overlapDiff: string;
    countDiff: string;
    coherenceDiff: string;
    explanation: string;
  } | null>(null);

  const prevSize = useRef(500);
  const prevOverlap = useRef(100);
  const prevCount = useRef(0);

  useEffect(() => {
    checkBackendHealth().then(setIsBackendOnline);
  }, []);

  // Recalculate chunks
  useEffect(() => {
    if (!documentMetadata) return;

    const runChunking = async () => {
      setIsProcessing(true);
      try {
        const result = await chunkText(documentMetadata.text, strategy, params);
        setChunks(result.chunks);
        setStatistics(result.statistics);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      runChunking();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [documentMetadata, strategy, params]);

  // Track parameter adjustments
  useEffect(() => {
    if (chunks.length === 0) return;
    
    const sizeChange = params.chunk_size !== prevSize.current;
    const overlapChange = params.chunk_overlap !== prevOverlap.current;
    const countChange = chunks.length !== prevCount.current;
    
    if (sizeChange || overlapChange || countChange) {
      let explanation = "Adjusting strategy parameters changes how RAG models perceive the document context. ";
      if (sizeChange) {
        explanation += params.chunk_size! > prevSize.current 
          ? `Increasing chunk size to ${params.chunk_size} characters packs more text into each context window, preserving long-range ideas but potentially introducing irrelevant noise during vector query retrievals.`
          : `Decreasing chunk size to ${params.chunk_size} characters isolates individual facts cleanly, boosting vector search precision, but risks cutting sentences in half and fragmenting semantic coherence.`;
      } else if (overlapChange) {
        explanation += params.chunk_overlap! > prevOverlap.current
          ? `Increasing overlap duplicate buffers to ${params.chunk_overlap} characters ensures adjacent chunks share transitions, preventing fact loss, though it inflates database index storage costs.`
          : `Reducing overlap duplicate buffers to ${params.chunk_overlap} characters reduces vector index redundancy, saving server cost, but increases the risk that transition facts are lost at boundaries.`;
      }
      
      setParamDiffReport({
        sizeDiff: sizeChange ? `${prevSize.current} → ${params.chunk_size}` : "",
        overlapDiff: overlapChange ? `${prevOverlap.current} → ${params.chunk_overlap}` : "",
        countDiff: countChange ? `${prevCount.current} → ${chunks.length}` : "",
        coherenceDiff: sizeChange ? (params.chunk_size! > prevSize.current ? "maintained" : "reduced") : "",
        explanation
      });
      
      prevSize.current = params.chunk_size ?? 500;
      prevOverlap.current = params.chunk_overlap ?? 100;
      prevCount.current = chunks.length;
    }
  }, [params.chunk_size, params.chunk_overlap, chunks.length]);

  const handleUploadSuccess = (meta: FileMetadata) => {
    setChunks([]);
    setDocumentMetadata(meta);
    setSelectedChunkId(null);
    setActiveSidebarTab("controls");
  };

  const activeChunkForInspector = useMemo(() => {
    if (selectedChunkId === null) return null;
    return chunks.find((c) => c.id === selectedChunkId) || null;
  }, [chunks, selectedChunkId]);

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
            Controls
          </button>
          <button
            onClick={() => setActiveSidebarTab("analysis")}
            disabled={!documentMetadata}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer transition-all ${
              !documentMetadata ? "opacity-40 cursor-not-allowed" : ""
            } ${
              activeSidebarTab === "analysis"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analysis
          </button>
        </div>

        {/* Tab 1: Controls View */}
        {activeSidebarTab === "controls" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                <span>Load Document</span>
              </div>
              <DocumentUpload onUploadSuccess={handleUploadSuccess} isBackendOnline={isBackendOnline} />
            </div>

            {documentMetadata && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <Settings className="h-4 w-4" />
                    <span>Strategy</span>
                  </div>
                  <StrategyCard
                    selectedStrategy={strategy}
                    onSelect={(s) => {
                      setChunks([]);
                      setStrategy(s);
                    }}
                    isLearningMode={false}
                  />
                </div>

                <ParameterPanel
                  strategy={strategy}
                  params={params}
                  onChange={setParams}
                  isLearningMode={false}
                />
              </>
            )}
          </div>
        )}

        {/* Tab 2: Analysis View */}
        {activeSidebarTab === "analysis" && documentMetadata && (
          <div className="space-y-6">
            <AnalyticsBoard
              chunks={chunks}
              originalTextLength={documentMetadata.text.length}
              stats={statistics}
              isLearningMode={false}
            />

            <CompareStrategies
              isLearningMode={false}
              activeStrategy={strategy}
            />
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* COLUMN 2: WORKSPACE (Center 75%) -> 9 of 12 */}
      {/* ========================================== */}
      <section className="lg:col-span-9 h-full overflow-y-auto px-1 flex flex-col space-y-6 scrollbar-thin pb-6 position-sticky">
        {!documentMetadata ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-border border-dashed rounded-2xl bg-[#0a0a0c]/40">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3 animate-pulse" />
            <h3 className="font-bold text-sm text-foreground">No Document Loaded</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Upload a document in the left panel to load the RAG Lab workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline */}
            {chunks.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-widest block">
                  Chunk Timeline Track Map
                </span>
                <ChunkTimeline
                  chunks={chunks}
                  totalLength={documentMetadata.char_count}
                  hoveredChunkId={null}
                  setHoveredChunkId={() => {}}
                  selectedChunkId={selectedChunkId}
                  setSelectedChunkId={setSelectedChunkId}
                  isLearningMode={false}
                />
              </div>
            )}

            {/* Live Visualizer */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-widest block">
                Visual Text Boundary Workspace
              </span>
              <LiveVisualizer
                originalText={documentMetadata.text}
                chunks={chunks}
                hoveredChunkId={null}
                setHoveredChunkId={() => {}}
                selectedChunkId={selectedChunkId}
                setSelectedChunkId={setSelectedChunkId}
              />
            </div>

            {/* Sticky "What Changed?" explanations */}
            {paramDiffReport && (
              <div className="glass-panel p-4 border border-primary/20 bg-primary/5 rounded-xl text-xs space-y-2">
                <span className="font-bold text-[10px] uppercase text-primary flex items-center">
                  <Info className="h-4 w-4 mr-1 text-primary" />
                  What just changed? (Differential analysis)
                </span>
                <p className="text-muted-foreground text-[10.5px] leading-relaxed">
                  {paramDiffReport.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Drawer inspector slide-out */}
      <ChunkInspector
        chunk={activeChunkForInspector}
        strategy={strategy}
        chunksCount={chunks.length}
        onClose={() => setSelectedChunkId(null)}
        onNavigate={(id) => setSelectedChunkId(id)}
        chunkSizeSetting={params.chunk_size}
        overlapSetting={params.chunk_overlap}
      />
    </div>
  );
}
