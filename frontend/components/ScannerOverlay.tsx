"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, ShieldAlert, Cpu, Hash } from "lucide-react";

interface ScannerOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  targetChunkCount: number;
  processingTimeMs: number;
}

type ScanStep = "scanning" | "boundaries" | "assembling" | "overlap" | "complete";

export default function ScannerOverlay({
  isVisible,
  onComplete,
  targetChunkCount,
  processingTimeMs,
}: ScannerOverlayProps) {
  const [step, setStep] = useState<ScanStep>("scanning");
  const [progress, setProgress] = useState(0);
  const [runningChunkCount, setRunningChunkCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStep("scanning");
      setProgress(0);
      setRunningChunkCount(0);
      return;
    }

    // Step 1: Scanning Text (0% - 30%)
    setStep("scanning");
    const scanInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 30) {
          clearInterval(scanInterval);
          // Transition to Step 2: Boundaries (30% - 60%)
          setStep("boundaries");
          return 30;
        }
        return prev + 5;
      });
    }, 45);

    return () => clearInterval(scanInterval);
  }, [isVisible]);

  useEffect(() => {
    if (step === "boundaries") {
      const boundaryInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 60) {
            clearInterval(boundaryInterval);
            // Transition to Step 3: Assembling (60% - 85%)
            setStep("assembling");
            return 60;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(boundaryInterval);
    }
  }, [step]);

  useEffect(() => {
    if (step === "assembling") {
      // Tick chunk count upwards to targets
      const tickStep = Math.max(1, Math.ceil(targetChunkCount / 8));
      const counterInterval = setInterval(() => {
        setRunningChunkCount((prev) => {
          if (prev >= targetChunkCount) {
            clearInterval(counterInterval);
            return targetChunkCount;
          }
          return Math.min(targetChunkCount, prev + tickStep);
        });
      }, 40);

      const assembleInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(assembleInterval);
            // Transition to Step 4: Overlap (85% - 100%)
            setStep("overlap");
            return 85;
          }
          return prev + 4;
        });
      }, 45);

      return () => {
        clearInterval(counterInterval);
        clearInterval(assembleInterval);
      };
    }
  }, [step, targetChunkCount]);

  useEffect(() => {
    if (step === "overlap") {
      const overlapInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(overlapInterval);
            // Complete
            setStep("complete");
            return 100;
          }
          return prev + 5;
        });
      }, 45);
      return () => clearInterval(overlapInterval);
    }
  }, [step]);

  useEffect(() => {
    if (step === "complete") {
      const timeout = setTimeout(() => {
        onComplete();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [step, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
      >
        <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-border bg-card/90 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center justify-center space-x-1.5">
              <Cpu className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
              <span>Compilation Chunker Active</span>
            </h3>
            <p className="text-[10px] text-muted-foreground">Analyzing text node boundaries on the fly</p>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono font-bold text-muted-foreground">
              <span>PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary/80 border border-border/60 rounded-full overflow-hidden">
              <motion.div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary to-indigo-400"
                layout
              />
            </div>
          </div>

          {/* Steps Checklist */}
          <div className="space-y-2.5 text-xs font-semibold text-muted-foreground bg-secondary/20 p-4 border border-border/50 rounded-xl">
            {/* Step 1 */}
            <div className="flex items-center justify-between">
              <span className={step !== "scanning" ? "text-foreground" : "text-primary animate-pulse"}>
                1. Ingesting & scanning raw characters...
              </span>
              {progress > 30 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/30 ${step === "scanning" ? "animate-spin" : ""}`} />
              )}
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between">
              <span className={step === "boundaries" ? "text-primary animate-pulse" : progress > 60 ? "text-foreground" : "text-muted-foreground/30"}>
                2. Detecting boundaries and separator tags...
              </span>
              {progress > 60 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/30 ${step === "boundaries" ? "animate-spin" : ""}`} />
              )}
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between">
              <span className={step === "assembling" ? "text-primary animate-pulse" : progress > 85 ? "text-foreground" : "text-muted-foreground/30"}>
                3. Packing chunks (counting words/tokens)...
              </span>
              {progress > 85 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/30 ${step === "assembling" ? "animate-spin" : ""}`} />
              )}
            </div>

            {/* Step 4 */}
            <div className="flex items-center justify-between">
              <span className={step === "overlap" ? "text-primary animate-pulse" : progress === 100 ? "text-foreground" : "text-muted-foreground/30"}>
                4. Computing neighbor overlap buffers...
              </span>
              {progress === 100 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/30 ${step === "overlap" ? "animate-spin" : ""}`} />
              )}
            </div>
          </div>

          {/* real time stats row */}
          <div className="flex justify-between items-center text-[10px] font-mono border-t border-border pt-4 text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Hash className="h-3.5 w-3.5 text-primary" />
              <span>Chunks: <b className="text-foreground">{runningChunkCount}</b></span>
            </span>
            <span>Speed: <b className="text-foreground">{processingTimeMs} ms</b></span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
