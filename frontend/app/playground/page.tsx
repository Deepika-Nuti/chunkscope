"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Activity,
  BarChart2,
  FileText,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Info,
  RefreshCw,
  Layers,
  Terminal,
  Grid,
  Network,
  HelpCircle,
  Eye,
  Settings2,
  CheckCircle2,
  Search
} from "lucide-react";

import DocumentUpload from "../../components/DocumentUpload";
import StrategyCard from "../../components/StrategyCard";
import ParameterPanel from "../../components/ParameterPanel";
import LiveVisualizer from "../../components/LiveVisualizer";
import AnalyticsBoard from "../../components/AnalyticsBoard";
import EduOverlay from "../../components/EduOverlay";
import ChunkTimeline from "../../components/ChunkTimeline";
import VisualOverlapExplorer from "../../components/VisualOverlapExplorer";
import TokenHeatmap from "../../components/TokenHeatmap";
import ChunkInspector from "../../components/ChunkInspector";
import ScannerOverlay from "../../components/ScannerOverlay";
import CommandPalette from "../../components/CommandPalette";

// Phase 2 Semantic Imports
import EmbeddingJourneyTimeline from "../../components/EmbeddingJourneyTimeline";
import EmbeddingViewer from "../../components/EmbeddingViewer";
import EmbeddingInspector from "../../components/EmbeddingInspector";
import SimilarityExplorer from "../../components/SimilarityExplorer";
import ClusterExplorer from "../../components/ClusterExplorer";
import SemanticHeatmap from "../../components/SemanticHeatmap";
import EmbeddingComparisonPanel from "../../components/EmbeddingComparisonPanel";
import SemanticExplanationPanel from "../../components/SemanticExplanationPanel";
import SemanticNeighborhood from "../../components/SemanticNeighborhood";

// Phase 2 UX Pass Imports
import LandingSplash from "../../components/LandingSplash";
import LearningJourney from "../../components/LearningJourney";
import GuidedLearningWizard from "../../components/GuidedLearningWizard";
import CompareStrategies from "../../components/CompareStrategies";
import RetrievalSimulator from "../../components/RetrievalSimulator";
import BenchmarkCompare from "../../components/BenchmarkCompare";

import { FileMetadata, chunkText, checkBackendHealth, generateSemanticWorkspace } from "../../lib/api";
import { Chunk, ChunkParams, simulateChunking } from "../../lib/fallback-engine";
import { EmbeddedChunk, SemanticEdge } from "../../lib/semantic-fallback";

export default function Playground() {
  // Experience Mode States
  const [showSplash, setShowSplash] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [wizardStep, setWizardStep] = useState(1);
  const [showExpertAnalysis, setShowExpertAnalysis] = useState(false);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<"visualizer" | "density" | "semantic" | "retrieval" | "benchmark">("visualizer");
  
  // Document State
  const [documentMetadata, setDocumentMetadata] = useState<FileMetadata | null>(null);
  
  // Chunker Parameters State
  const [strategy, setStrategy] = useState<string>("recursive");
  const [params, setParams] = useState<ChunkParams>({
    chunk_size: 500,
    chunk_overlap: 100,
    sentences_per_chunk: 3,
    paragraphs_per_chunk: 1,
    window_size: 100,
    stride: 50,
  });

  // Output Chunks State
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Scanner Animation States
  const [isScanning, setIsScanning] = useState(false);
  const [pendingChunks, setPendingChunks] = useState<Chunk[]>([]);
  const [pendingStats, setPendingStats] = useState<any>(null);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Highlighting synchronization state
  const [hoveredChunkId, setHoveredChunkId] = useState<number | null>(null);
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);

  // Phase 2 Semantic Workspace States
  const [embeddingModel, setEmbeddingModel] = useState<string>("all-MiniLM-L6-v2");
  const [projectionMethod, setProjectionMethod] = useState<string>("pca");
  const [clusteringMethod, setClusteringMethod] = useState<string>("kmeans");
  const [kClustersSetting, setKClustersSetting] = useState<number>(3);
  const [embeddedChunks, setEmbeddedChunks] = useState<EmbeddedChunk[]>([]);
  const [semanticEdges, setSemanticEdges] = useState<SemanticEdge[]>([]);
  const [semanticMetrics, setSemanticMetrics] = useState<any>(null);
  const [isSemanticLoading, setIsSemanticLoading] = useState<boolean>(false);
  
  // Stepper & right column sub-tabs
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(3);
  const [activeSemanticSubTab, setActiveSemanticSubTab] = useState<"inspector" | "neighbors" | "clustering" | "compare">("inspector");

  // Side-by-side Comparison data cache
  const [comparisonCache, setComparisonCache] = useState<Record<string, any>>({});
  const [isCalculatingComparison, setIsCalculatingComparison] = useState(false);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth().then(setIsBackendOnline);
  }, []);

  // Keyboard shortcut Ctrl+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Recalculate chunks when text, strategy, or parameters change
  useEffect(() => {
    if (!documentMetadata) return;

    const runChunking = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await chunkText(documentMetadata.text, strategy, params);
        
        // Determine whether to trigger full scanner overlay animation or update instantly.
        const isStrategyChange = pendingChunks.length === 0 || chunks.length === 0;
        
        if (isStrategyChange) {
          setPendingChunks(result.chunks);
          setPendingStats(result.statistics);
          setIsScanning(true);
        } else {
          // Silent instant swap on slider drags
          setChunks(result.chunks);
          setStatistics(result.statistics);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to process chunking.");
      } finally {
        setIsProcessing(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      runChunking();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [documentMetadata, strategy, params]);

  // Recalculate embeddings & projection maps when chunks list changes
  useEffect(() => {
    if (chunks.length === 0) {
      setEmbeddedChunks([]);
      setSemanticEdges([]);
      setSemanticMetrics(null);
      return;
    }

    const runSemanticPipeline = async () => {
      setIsSemanticLoading(true);
      try {
        const result = await generateSemanticWorkspace(
          chunks,
          embeddingModel,
          projectionMethod,
          clusteringMethod,
          kClustersSetting
        );
        setEmbeddedChunks(result.chunks);
        setSemanticEdges(result.edges);
        setSemanticMetrics(result.metrics);
        
        if (selectedChunkId === null && result.chunks.length > 0) {
          setSelectedChunkId(parseInt(result.chunks[0].id));
        }
      } catch (err) {
        console.error("Semantic workspace failed:", err);
      } finally {
        setIsSemanticLoading(false);
      }
    };

    runSemanticPipeline();
  }, [chunks, embeddingModel, projectionMethod, clusteringMethod, kClustersSetting]);

  // Track parameter adjustments to generate educational descriptions on what changed
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

  // Recalculate comparison stats of all strategies on the text for comparison tab
  useEffect(() => {
    if (!documentMetadata || activeTab !== "benchmark") return;

    const computeAllComparisons = () => {
      setIsCalculatingComparison(true);
      const text = documentMetadata.text;
      
      const strategiesToCompare = [
        { id: "fixed", name: "Fixed Size", params: { chunk_size: 500, chunk_overlap: 100 } },
        { id: "recursive", name: "Recursive Character", params: { chunk_size: 500, chunk_overlap: 100 } },
        { id: "sentence", name: "Sentence Chunking", params: { sentences_per_chunk: 3 } },
        { id: "paragraph", name: "Paragraph Chunking", params: { paragraphs_per_chunk: 1 } },
        { id: "sliding", name: "Sliding Window", params: { window_size: 100, stride: 50 } },
      ];

      const results: Record<string, any> = {};
      
      for (const strat of strategiesToCompare) {
        const out = simulateChunking(text, strat.id, strat.params);
        results[strat.id] = {
          name: strat.name,
          chunksCount: out.chunks.length,
          avgSize: out.statistics.avg_chunk_size,
          avgTokens: out.statistics.avg_token_count,
          largest: out.statistics.largest_chunk,
          smallest: out.statistics.smallest_chunk,
          speed: out.statistics.processing_time_ms,
        };
      }
      
      setComparisonCache(results);
      setIsCalculatingComparison(false);
    };

    computeAllComparisons();
  }, [documentMetadata, activeTab]);

  const handleUploadSuccess = (meta: FileMetadata) => {
    setChunks([]);
    setPendingChunks([]);
    setDocumentMetadata(meta);
    setComparisonCache({});
    setSelectedChunkId(null);
    setWizardStep(2); // Automatically advance step once document loaded
  };

  const handleScanComplete = () => {
    setChunks(pendingChunks);
    setStatistics(pendingStats);
    setIsScanning(false);
  };

  const activeChunkForInspector = useMemo(() => {
    if (selectedChunkId === null) return null;
    return chunks.find((c) => c.id === selectedChunkId) || null;
  }, [chunks, selectedChunkId]);

  const activeEmbeddedChunk = useMemo(() => {
    if (selectedChunkId === null || embeddedChunks.length === 0) return null;
    return embeddedChunks.find((c) => parseInt(c.id) === selectedChunkId) || null;
  }, [embeddedChunks, selectedChunkId]);

  const handleSplashChoose = (choice: "learning" | "expert") => {
    if (choice === "learning") {
      setIsLearningMode(true);
      setShowExpertAnalysis(false);
      setWizardStep(1);
    } else {
      setIsLearningMode(false);
      setShowExpertAnalysis(true);
    }
    setShowSplash(false);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans select-none">
      
      {/* 0. Beginner Landing Splash Overlay */}
      {showSplash && <LandingSplash onChoose={handleSplashChoose} />}

      {/* Animated Document Scanner overlay */}
      <ScannerOverlay
        isVisible={isScanning}
        onComplete={handleScanComplete}
        targetChunkCount={pendingChunks.length}
        processingTimeMs={pendingStats?.processing_time_ms || 120}
      />

      {/* Ctrl+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectStrategy={(s) => setStrategy(s)}
        onToggleExplainMode={() => setIsLearningMode(!isLearningMode)}
        onClearDocument={() => setDocumentMetadata(null)}
        onLoadDemo={handleUploadSuccess}
      />

      {/* 1. Header Row */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shrink-0 h-[64px]">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-1.5 hover:bg-secondary rounded-lg border border-border transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                ChunkScope
              </span>
              <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {isLearningMode ? "Learning Mode" : "Expert Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-4">
          {/* Toggle Experience Mode Button */}
          <button
            onClick={() => {
              setIsLearningMode(!isLearningMode);
              setShowExpertAnalysis(!isLearningMode ? true : false);
            }}
            className="text-[10px] bg-secondary border border-border px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-secondary/80 flex items-center space-x-1.5 transition-all"
          >
            <Settings2 className="h-3.5 w-3.5 text-primary" />
            <span>Switch to {isLearningMode ? "Expert Mode" : "Learning Mode"}</span>
          </button>

          {/* Command Palette Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="text-[10px] bg-secondary border border-border px-3 py-1.5 rounded-lg font-semibold cursor-pointer hover:bg-secondary/80 flex items-center space-x-2 transition-all"
            title="Open commands"
          >
            <Terminal className="h-3.5 w-3.5" />
            <kbd className="bg-background border border-border/80 px-1 py-0.5 rounded text-[8px] font-mono text-muted-foreground ml-1">
              Ctrl+K
            </kbd>
          </button>

          {/* API Health Indicator */}
          <div className="flex items-center space-x-1.5 text-[10px] bg-secondary/80 px-2.5 py-1 rounded-full border border-border">
            <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            <span className="font-semibold">
              {isBackendOnline ? "Online" : "Fallback (JS)"}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Grid: Refactored into a 3-column independently scrolling viewport */}
      <main className="flex-1 w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* ============================================================== */}
        {/* COLUMN 1: DOCUMENT INGESTION & USER JOURNEY (Width: 1/5)       */}
        {/* ============================================================== */}
        <section className="lg:col-span-1 h-full overflow-y-auto pr-1 flex flex-col space-y-6 scrollbar-thin pb-6 border-r border-border/40 pr-4">
          {/* Upload card */}
          <div className={`space-y-2 transition-all ${wizardStep === 1 && isLearningMode ? "ring-2 ring-primary p-1 rounded-xl" : ""}`}>
            <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              <FileText className="h-4 w-4 text-primary" />
              <span>1. Load Document</span>
            </div>
            <DocumentUpload onUploadSuccess={handleUploadSuccess} isBackendOnline={isBackendOnline} />
          </div>

          {documentMetadata && (
            <>
              {/* Document details box */}
              <div className="glass-panel p-4 rounded-xl border border-border bg-card/45 space-y-2 text-xs">
                <div className="font-semibold text-foreground truncate border-b border-border pb-1.5 flex items-center justify-between">
                  <span className="truncate">{documentMetadata.filename}</span>
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-sans uppercase">Loaded</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground font-mono text-[10px]">
                  <div>Words: <b className="text-foreground">{documentMetadata.word_count}</b></div>
                  <div>Chars: <b className="text-foreground">{documentMetadata.char_count}</b></div>
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    Tokens (Est): <b className="text-primary font-bold">{documentMetadata.token_count}</b>
                  </div>
                </div>
              </div>

              {/* Learning Checklist Progress vertical list (Moved to Left Sidebar Explorer) */}
              <LearningJourney
                currentStep={wizardStep}
                hasDocument={!!documentMetadata}
                onSelectStep={(step) => {
                  setWizardStep(step);
                  // Auto-switch tabs to match visual representations with active tutorial guide steps
                  if (step <= 4) {
                    setActiveTab("visualizer");
                  } else if (step === 5) {
                    setActiveTab("semantic");
                  } else if (step === 6) {
                    setActiveTab("retrieval");
                  } else if (step === 7) {
                    setActiveTab("visualizer");
                  }
                }}
              />
            </>
          )}
        </section>

        {/* ============================================================== */}
        {/* COLUMN 2: LIVE VISUALIZATION VIEWPORT (Width: 2/5 - CENTER FOCUS) */}
        {/* ============================================================== */}
        <section className="lg:col-span-2 h-full overflow-y-auto px-1 flex flex-col space-y-6 scrollbar-thin pb-6 px-2">
          {/* Main workspace navigation tabs */}
          {documentMetadata && (
            <div className="flex justify-between items-center border-b border-border pb-2 shrink-0">
              <div className="flex space-x-1 p-0.5 bg-secondary/40 border border-border rounded-lg">
                {[
                  { id: "visualizer", label: "Live Visualizer", icon: Activity },
                  { id: "density", label: "Density & Overlaps", icon: Grid },
                  { id: "semantic", label: "Semantic Space", icon: Network },
                  { id: "retrieval", label: "Retrieval Simulator", icon: Search },
                  { id: "benchmark", label: "Benchmark Compare", icon: BarChart2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer flex items-center space-x-1.5 transition-all ${
                      activeTab === tab.id
                        ? "bg-card border border-border shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guided Learning Mode Stepper Banner */}
          {isLearningMode && documentMetadata && (
            <GuidedLearningWizard
              currentStep={wizardStep}
              setCurrentStep={(step) => {
                setWizardStep(step);
                // Synchronize tab mappings
                if (step <= 4) {
                  setActiveTab("visualizer");
                } else if (step === 5) {
                  setActiveTab("semantic");
                } else if (step === 6) {
                  setActiveTab("retrieval");
                } else if (step === 7) {
                  setActiveTab("visualizer");
                }
              }}
              strategy={strategy}
            />
          )}

          {/* Active Visualizer Viewport */}
          <div className="flex-1 min-h-0 relative">
            {!documentMetadata ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-border border-dashed rounded-2xl bg-card/30 min-h-[400px]">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-3 animate-pulse" />
                <h3 className="font-bold text-sm text-foreground">No Document Ingested</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Upload a PDF, DOCX, TXT, or Markdown document in the left panel to begin your learning journey.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Active Tab render */}
                {activeTab === "visualizer" && (
                  <div className="space-y-4">
                    {/* Stage 7 Export view center card overrides in Learning Mode */}
                    {wizardStep === 7 && isLearningMode ? (
                      <div className="glass-panel p-6 border border-primary/20 bg-card rounded-2xl space-y-4">
                        <div className="flex items-center space-x-2 border-b border-border/40 pb-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                            Stage 7: Export Processed Index
                          </h3>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Congratulations! Your document has been parsed, chunk boundaries finetuned, semantic neighbor index computed, and coordinates projected. You are ready to export the result.
                        </p>

                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Index Dataset Preview (JSON)
                          </span>
                          <pre className="bg-[#0c0c0f] border border-border p-4 rounded-xl text-[9px] font-mono text-zinc-400 overflow-x-auto max-h-48 scrollbar-thin">
                            {JSON.stringify({
                              project: "ChunkScope",
                              document: documentMetadata.filename,
                              strategy: strategy,
                              total_chunks: chunks.length,
                              parameters: params,
                              chunks: chunks.slice(0, 2).map((c) => ({
                                id: c.id,
                                text: c.text.substring(0, 60) + "...",
                                tokens: c.token_count,
                                range: `${c.start_char}-${c.end_char}`
                              }))
                            }, null, 2)}
                          </pre>
                        </div>

                        <button
                          onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
                              JSON.stringify({
                                project: "ChunkScope",
                                document: documentMetadata.filename,
                                strategy: strategy,
                                parameters: params,
                                chunks: chunks.map(c => ({
                                  id: c.id,
                                  text: c.text,
                                  tokens: c.token_count,
                                  range: { start: c.start_char, end: c.end_char }
                                }))
                              }, null, 2)
                            );
                            const downloadAnchor = document.createElement('a');
                            downloadAnchor.setAttribute("href", dataStr);
                            downloadAnchor.setAttribute("download", `chunkscope-${strategy}-export.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                          }}
                          className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Download Index JSON</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {isProcessing && (
                          <div className="text-[11px] bg-secondary/80 border border-border rounded-lg p-2.5 text-muted-foreground flex items-center space-x-2 shrink-0 animate-pulse">
                            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
                            <span>Updating split boundaries...</span>
                          </div>
                        )}
                        
                        <LiveVisualizer
                          originalText={documentMetadata.text}
                          chunks={chunks}
                          hoveredChunkId={hoveredChunkId}
                          setHoveredChunkId={setHoveredChunkId}
                          selectedChunkId={selectedChunkId}
                          setSelectedChunkId={setSelectedChunkId}
                          isProcessing={isProcessing}
                        />
                      </>
                    )}
                  </div>
                )}

                {activeTab === "density" && (
                  <div className="space-y-6">
                    <VisualOverlapExplorer
                      chunks={chunks}
                      originalTextLength={documentMetadata.char_count}
                      isLearningMode={isLearningMode}
                    />
                    <TokenHeatmap
                      originalText={documentMetadata.text}
                      isLearningMode={isLearningMode}
                    />
                  </div>
                )}

                {/* SEMANTIC TAB */}
                {activeTab === "semantic" && (
                  <div className="space-y-6">
                    <EmbeddingJourneyTimeline
                      isLearningMode={isLearningMode}
                      activeStep={activeJourneyStep}
                      setActiveStep={setActiveJourneyStep}
                    />

                    {isSemanticLoading ? (
                      <div className="h-96 flex flex-col items-center justify-center text-xs text-muted-foreground bg-card/25 border border-border border-dashed rounded-2xl animate-pulse">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                        <span>Generating semantic vector clusters...</span>
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
                          isLearningMode={isLearningMode}
                        />

                        {/* Hide correlation matrix in Learning Mode (progressive disclosure) */}
                        {showExpertAnalysis && (
                          <SemanticHeatmap
                            chunks={embeddedChunks}
                            isLearningMode={isLearningMode}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* RETRIEVAL TAB */}
                {activeTab === "retrieval" && (
                  <RetrievalSimulator
                    chunks={embeddedChunks}
                    embeddingModel={embeddingModel}
                    isLearningMode={isLearningMode}
                    onHighlightChunk={(id) => setSelectedChunkId(id)}
                  />
                )}

                {/* BENCHMARK TAB */}
                {activeTab === "benchmark" && (
                  <BenchmarkCompare
                    originalText={documentMetadata.text}
                    isLearningMode={isLearningMode}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sticky Educational Explanation Panel (Problem 9: updates dynamically on slider changes) */}
          {documentMetadata && (
            <div className="glass-panel p-4 border border-primary/25 bg-primary/5 rounded-xl text-xs space-y-2 shrink-0">
              <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-primary flex items-center">
                <Info className="h-4 w-4 mr-1 text-primary animate-pulse" />
                What just happened? (Interactive Analysis)
              </span>

              {paramDiffReport ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[10.5px] leading-relaxed">
                    {paramDiffReport.explanation}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-muted-foreground pt-1.5 border-t border-border/40">
                    {paramDiffReport.countDiff && (
                      <div>✓ Chunk count: <span className="font-bold text-foreground">{paramDiffReport.countDiff}</span></div>
                    )}
                    {paramDiffReport.sizeDiff && (
                      <div>✓ Chunk size: <span className="font-bold text-foreground">{paramDiffReport.sizeDiff}</span></div>
                    )}
                    {paramDiffReport.overlapDiff && (
                      <div>✓ Overlap size: <span className="font-bold text-foreground">{paramDiffReport.overlapDiff}</span></div>
                    )}
                    {paramDiffReport.coherenceDiff && (
                      <div>✓ Coherence: <span className="font-bold text-foreground">{paramDiffReport.coherenceDiff}</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-[10px] leading-normal italic">
                  Drag parameter sliders in the right panel to analyze RAG index tradeoffs in real-time.
                </p>
              )}
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* COLUMN 3: PROPERTIES, PARAMETERS & ANALYSIS (Width: 2/5 - RIGHT SIDEBAR) */}
        {/* ============================================================== */}
        <section className="lg:col-span-2 h-full overflow-y-auto pl-1 flex flex-col space-y-6 scrollbar-thin pb-6 border-l border-border/40 pl-4">
          
          {documentMetadata && (
            <>
              {/* Strategy Selector (Figma properties sidebar) */}
              {(!isLearningMode || wizardStep >= 2) && (
                <div className={`space-y-2 transition-all ${wizardStep === 2 && isLearningMode ? "ring-2 ring-primary p-1 rounded-xl animate-pulse" : ""}`}>
                  <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <Settings className="h-4 w-4 text-primary" />
                    <span>2. Split Strategy</span>
                  </div>
                  
                  <div className="text-[9.5px] text-muted-foreground/60 italic pb-1">
                    "How should the document be split?"
                  </div>

                  <StrategyCard
                    selectedStrategy={strategy}
                    onSelect={(s) => {
                      setChunks([]);
                      setStrategy(s);
                    }}
                    isLearningMode={isLearningMode}
                  />
                </div>
              )}

              {/* Parameter Configuration panel (Figma properties sidebar) */}
              {(!isLearningMode || wizardStep >= 3) && (
                <div className={`transition-all ${wizardStep === 3 && isLearningMode ? "ring-2 ring-primary p-1 rounded-xl animate-pulse" : ""}`}>
                  <ParameterPanel
                    strategy={strategy}
                    params={params}
                    onChange={setParams}
                    isLearningMode={isLearningMode}
                  />
                </div>
              )}

              {/* Progressive Disclosure Toggle */}
              <div className="flex justify-between items-center bg-secondary/35 border border-border p-3 rounded-xl text-xs">
                <span className="font-semibold text-muted-foreground flex items-center">
                  <Eye className="h-4 w-4 mr-1 text-primary" />
                  Show Expert analysis panels
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExpertAnalysis}
                    onChange={() => setShowExpertAnalysis(!showExpertAnalysis)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-secondary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* RAG Diagnostics Analytics Board */}
              {(!isLearningMode || wizardStep >= 4) && (
                <AnalyticsBoard
                  chunks={chunks}
                  originalTextLength={documentMetadata.text.length}
                  stats={statistics}
                  isLearningMode={!showExpertAnalysis}
                />
              )}

              {/* Strategy Comparison Matrix */}
              {(!isLearningMode || wizardStep >= 4) && (
                <CompareStrategies
                  isLearningMode={isLearningMode}
                  activeStrategy={strategy}
                />
              )}

              {/* Semantic Space sub-inspector panels (only shown on semantic tab) */}
              {activeTab === "semantic" && embeddedChunks.length > 0 && (
                <div className="space-y-5">
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

                  <div className="space-y-5">
                    {activeSemanticSubTab === "inspector" && (
                      <>
                        <EmbeddingInspector
                          chunk={activeEmbeddedChunk}
                          strategy={strategy}
                          onNavigate={(id) => setSelectedChunkId(id)}
                          chunksCount={embeddedChunks.length}
                        />
                        <EmbeddingComparisonPanel isLearningMode={isLearningMode} />
                      </>
                    )}

                    {activeSemanticSubTab === "neighbors" && (
                      <>
                        <SemanticNeighborhood
                          selectedChunk={activeEmbeddedChunk}
                          allChunks={embeddedChunks}
                          onSelectChunk={(id) => setSelectedChunkId(id)}
                          isLearningMode={isLearningMode}
                        />
                        <SimilarityExplorer
                          selectedChunk={activeEmbeddedChunk}
                          allChunks={embeddedChunks}
                          onSelectChunk={(id) => setSelectedChunkId(id)}
                          isLearningMode={isLearningMode}
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
                        isLearningMode={isLearningMode}
                        onSelectChunk={(id) => setSelectedChunkId(id)}
                      />
                    )}

                    {activeSemanticSubTab === "compare" && (
                      <SemanticExplanationPanel
                        chunks={embeddedChunks}
                        isLearningMode={isLearningMode}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Drawer inspector slide-out for selected chunk (With educational Question headers) */}
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
