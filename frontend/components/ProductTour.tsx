"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, X, FileText, Cpu, Network, Search, Layers } from "lucide-react";

interface ProductTourProps {
  onComplete: () => void;
}

export default function ProductTour({ onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("chunkscope-tour-dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const tourSteps = [
    {
      title: "Welcome to ChunkScope",
      description: "ChunkScope is a visual interactive playground designed to teach you how document chunking and retrieval-augmented generation (RAG) works under the hood.",
      icon: Sparkles,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "1. Upload & Ingest Documents",
      description: "Drag-and-drop your custom PDFs, text, or markdown files. Alternatively, instantly load files from the demo library.",
      icon: FileText,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "2. Choose Strategies & Parameters",
      description: "Pick from 5 standard chunking algorithms: Fixed-Size, Recursive, Sentence, Paragraph, or Sliding-Window. Move sliders to adjust bounds and overlap characters.",
      icon: Layers,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "3. Project Vector Embeddings",
      description: "See your document segments transformed into high-dimensional vector representations. Swap between PCA, t-SNE, or UMAP projections and explore coordinate distances.",
      icon: Network,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "4. Simulate Database Retrieval",
      description: "Input search queries to watch the real-time RAG retrieval pipeline query your vector database, compute cosine similarity, and build prompt contexts.",
      icon: Search,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem("chunkscope-tour-dismissed", "true");
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const ActiveIcon = tourSteps[currentStep].icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Interactive Product Tour (Step {currentStep + 1} of {tourSteps.length})
            </span>
            <button
              onClick={handleClose}
              className="p-1 hover:text-primary transition-all rounded hover:bg-secondary cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Close Product Tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body content with animations */}
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className={`p-4 rounded-full border ${tourSteps[currentStep].color} animate-pulse`}>
              <ActiveIcon className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">
                {tourSteps[currentStep].title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {tourSteps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Stepper Dots indicators */}
          <div className="flex justify-center space-x-1.5 py-1">
            {tourSteps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-5 bg-primary" : "w-1.5 bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Actions Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <button
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              Skip Tour
            </button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 text-xs bg-secondary border border-border rounded-xl cursor-pointer hover:bg-secondary/70 flex items-center space-x-1 transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs bg-primary text-primary-foreground font-extrabold rounded-xl cursor-pointer hover:opacity-90 flex items-center space-x-1.5 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span>{currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
