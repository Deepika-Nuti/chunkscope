"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Terminal, CheckCircle2, AlertCircle, Sparkles, Hash } from "lucide-react";
import { Chunk, ChunkParams, simulateChunking } from "../lib/fallback-engine";
import { getChunkColor, getChunkBorderColor } from "./LiveVisualizer";

interface WatchChunkingProps {
  originalText: string;
  strategy: string;
  params: ChunkParams;
  onClose: () => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning";
}

export default function WatchChunking({
  originalText,
  strategy,
  params,
  onClose,
}: WatchChunkingProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [scanIndex, setScanIndex] = useState(0);
  const [simulatedChunks, setSimulatedChunks] = useState<Chunk[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Real-time metrics
  const [currentTokenCount, setCurrentTokenCount] = useState(0);
  const [lastSeparator, setLastSeparator] = useState<string>("None");
  const [currentConfidence, setCurrentConfidence] = useState(100);
  const [statusText, setStatusText] = useState("Initializing Chunker...");

  const textRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Parse the document using our baseline simulator to get final targets
  const finalSplitResult = useMemo(() => {
    return simulateChunking(originalText, strategy, params);
  }, [originalText, strategy, params]);

  const targetChunks = finalSplitResult.chunks;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Main animation driver
  useEffect(() => {
    if (!isPlaying) return;

    const totalLength = originalText.length;
    const intervalTime = 60; // ms per step

    const timer = setInterval(() => {
      setScanIndex((prevIndex) => {
        const nextIndex = Math.min(totalLength, prevIndex + Math.ceil(totalLength / 80));
        
        // Match scan position against actual generated chunks
        const currentScannedText = originalText.slice(0, nextIndex);
        const activeChunks = targetChunks.filter((c) => c.end_char <= nextIndex);
        setSimulatedChunks(activeChunks);

        // Update live metrics
        const charsInCurrentPool = nextIndex - (activeChunks[activeChunks.length - 1]?.end_char || 0);
        setCurrentTokenCount(Math.round(charsInCurrentPool / 4.1));
        
        // Find separators in the active window
        const separatorMatches = ["\n\n", "\n", ". ", "? ", "! ", " "];
        let detected = "None";
        for (const sep of separatorMatches) {
          if (originalText.slice(Math.max(0, nextIndex - 5), nextIndex).includes(sep)) {
            detected = sep === "\n\n" ? "Double Newline" : sep === "\n" ? "Newline" : "Sentence Boundary";
            break;
          }
        }
        setLastSeparator(detected);

        // Generate logs dynamically
        if (nextIndex < totalLength) {
          setStatusText("Scanning document characters...");
          
          if (detected !== "None" && Math.random() > 0.8) {
            addLog(`Audit boundary match: "${detected}" detected near char ${nextIndex}`, "info");
          }

          // Trigger log on chunk splits
          const justCreatedChunk = targetChunks.find((c) => c.end_char > prevIndex && c.end_char <= nextIndex);
          if (justCreatedChunk) {
            addLog(`✓ Created Chunk #${justCreatedChunk.id} at character range [${justCreatedChunk.start_char} - ${justCreatedChunk.end_char}]`, "success");
            addLog(`  Token count: ~${justCreatedChunk.token_count} | Overlap prev: ${justCreatedChunk.overlap_prev} chars`, "info");
            
            // Randomize confidence based on separator match strength
            const conf = strategy === "fixed" ? 45 : justCreatedChunk.text.endsWith("\n\n") ? 98 : 85;
            setCurrentConfidence(conf);
          }
        } else {
          // Completed scan
          setStatusText("Finalizing chunk map...");
          addLog("✓ Scanning complete! Document split successfully.", "success");
          addLog(`  Total chunks registered: ${targetChunks.length}`, "success");
          setIsPlaying(false);
          clearInterval(timer);
        }

        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, originalText, targetChunks, strategy]);

  const addLog = (message: string, type: "info" | "success" | "warning") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleRestart = () => {
    setScanIndex(0);
    setSimulatedChunks([]);
    setLogs([{ timestamp: new Date().toLocaleTimeString(), message: "Restarting chunking scanner...", type: "info" }]);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="w-full max-w-6xl h-[85vh] glass-panel border border-primary/20 bg-card rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/20">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              ChunkScope Algorithmic Scanner
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg border border-border transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Workspace content grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Left panel: Text stream & scanning marker (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col h-full space-y-4 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                Document Scanning Matrix ({Math.round((scanIndex / originalText.length) * 100)}% scanned)
              </span>
              
              {/* Scan state controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 bg-secondary border border-border rounded hover:bg-secondary/80 cursor-pointer flex items-center space-x-1 text-[10px] font-bold text-foreground"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 text-emerald-400" />}
                  <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>
                <button
                  onClick={handleRestart}
                  className="p-1 bg-secondary border border-border rounded hover:bg-secondary/80 cursor-pointer flex items-center space-x-1 text-[10px] font-bold text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Glowing Text Display Canvas */}
            <div
              ref={textRef}
              className="flex-1 overflow-y-auto bg-[#020203] border border-border/80 rounded-xl p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text relative"
            >
              {/* Highlighted scanned part */}
              <span className="text-foreground bg-primary/5">
                {originalText.slice(0, scanIndex)}
              </span>
              
              {/* Scanning cursor marker */}
              {scanIndex < originalText.length && (
                <span className="bg-primary text-primary-foreground animate-pulse px-0.5 relative z-10 font-bold border-l border-primary shadow-[0_0_10px_#6366f1]">
                  |
                </span>
              )}

              {/* Unscanned remainder */}
              <span className="text-muted-foreground/35">
                {originalText.slice(scanIndex)}
              </span>

              {/* Overlay segment boundary highlights */}
              {simulatedChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "100%",
                    pointerEvents: "none",
                  }}
                  className="hidden" // Just logic anchor
                />
              ))}
            </div>

            {/* Interactive Stats tracker footer block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-secondary/20 p-4 border border-border/60 rounded-xl text-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono block">CURSOR POSITION</span>
                <span className="font-mono font-bold text-foreground">{scanIndex} / {originalText.length} chars</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono block">TOKEN COUNT (POOL)</span>
                <span className="font-mono font-bold text-foreground">~{currentTokenCount} tokens</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono block">SEPARATOR DETECTED</span>
                <span className="font-mono font-bold text-primary">{lastSeparator}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono block">BOUNDARY CONFIDENCE</span>
                <span className={`font-mono font-bold ${
                  currentConfidence > 80 ? "text-emerald-400" : currentConfidence > 50 ? "text-amber-400" : "text-rose-400"
                }`}>
                  {currentConfidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Terminal logs & accumulated chunks inventory (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col h-full space-y-4 min-h-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
              Algorithmic Logs & Chunks
            </span>

            {/* Simulated Shell Terminal */}
            <div className="h-[200px] flex flex-col bg-[#050508] border border-border rounded-xl overflow-hidden font-mono text-[10px] text-zinc-400">
              <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/60 flex items-center space-x-1.5 shrink-0">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>stdout - Chunker Engine</span>
              </div>
              <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin select-text">
                {logs.length === 0 ? (
                  <span className="text-zinc-600 italic">Initializing scanner log output...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={
                        log.type === "success" ? "text-emerald-400" : log.type === "warning" ? "text-amber-400" : "text-zinc-300"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Generated inventory */}
            <div className="flex-1 min-h-0 bg-secondary/15 border border-border/50 rounded-xl p-4 flex flex-col overflow-hidden">
              <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider block mb-2 shrink-0">
                Registered Chunks ({simulatedChunks.length})
              </span>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {simulatedChunks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] text-zinc-500 italic">
                    Waiting for scanner splits...
                  </div>
                ) : (
                  simulatedChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-3 bg-[#0a0a0c] border border-border/80 rounded-lg text-[10px] font-mono space-y-1.5"
                      style={{ borderLeftWidth: "3px", borderLeftColor: getChunkBorderColor(chunk.id) }}
                    >
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                        <span className="font-bold text-foreground">Chunk #{chunk.id}</span>
                        <span>Len: {chunk.char_count} chars</span>
                      </div>
                      <p className="line-clamp-2 text-zinc-400">{chunk.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
