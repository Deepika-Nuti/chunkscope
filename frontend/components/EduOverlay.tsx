"use client";

import React from "react";
import { HelpCircle, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

interface EduOverlayProps {
  strategy: string;
  chunkCount: number;
  overlap: number;
}

export default function EduOverlay({ strategy, chunkCount, overlap }: EduOverlayProps) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-fade-in">
      <div className="flex items-center space-x-2 pb-2 border-b border-primary/10">
        <BookOpen className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm text-foreground">Under the Hood: Deep Learning Guide</h4>
      </div>

      <div className="space-y-3 text-xs leading-relaxed">
        {/* Why Chunking Matters */}
        <div>
          <h5 className="font-semibold text-foreground flex items-center mb-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
            Why are we chunking this document?
          </h5>
          <p className="text-muted-foreground">
            A raw document can be thousands of pages. LLMs have limited context windows and charge fees based on token usage. Chunking breaks text into small segments, allowing the retriever to search for and extract only the relevant parts, optimizing context window usage and avoiding the "lost in the middle" retrieval issue.
          </p>
        </div>

        {/* Overlaps explanation */}
        {overlap > 0 ? (
          <div>
            <h5 className="font-semibold text-foreground flex items-center mb-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
              Why is overlap highlighted in orange/stripes?
            </h5>
            <p className="text-muted-foreground">
              Your parameter setting uses an overlap of <b className="text-foreground">{overlap}</b> characters. This buffer copies text from the end of one chunk to the start of the next. If a sentence explaining a core concept is split down the middle (e.g. half in Chunk 1, half in Chunk 2), the semantic representation is broken. The overlap ensures transition points and adjacent contexts are preserved.
            </p>
          </div>
        ) : (
          <div>
            <h5 className="font-semibold text-foreground flex items-center mb-1">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2"></span>
              Zero Overlap Warning
            </h5>
            <p className="text-muted-foreground">
              You are currently using 0 overlap characters. This is efficient for storage and prevents data duplication in your vector index. However, it creates a high risk of **semantic fragmentation**: sentences split exactly at chunk boundaries will lose their semantic meaning, resulting in lower retrieval similarity scores.
            </p>
          </div>
        )}

        {/* Dynamic analysis of active strategy */}
        {strategy === "fixed" && (
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
            <h6 className="font-semibold text-rose-400 mb-1 flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Fixed Size Split Analysis
            </h6>
            <p className="text-muted-foreground text-[11px]">
              Notice how character-based fixed chunking cuts words or sentences directly in half. In the visualizer, look at the transition points. This leads to fractured embeddings because word vectors require complete tokens to represent context accurately.
            </p>
          </div>
        )}

        {strategy === "recursive" && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <h6 className="font-semibold text-emerald-400 mb-1 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Recursive Split Analysis
            </h6>
            <p className="text-muted-foreground text-[11px]">
              Observe how the recursive splitter respects structure. In the visualizer, boundaries align neatly with paragraph breaks (\n\n) or punctuation marks. This maintains high context consistency, making it the industry standard for text RAG.
            </p>
          </div>
        )}

        {strategy === "sentence" && (
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
            <h6 className="font-semibold text-indigo-400 mb-1 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Sentence Split Analysis
            </h6>
            <p className="text-muted-foreground text-[11px]">
              By isolating sentences, you group atomic arguments together. This is highly effective for detailed QA matching, but if your sentences are exceptionally long, your chunk character lengths will vary significantly.
            </p>
          </div>
        )}

        {strategy === "paragraph" && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <h6 className="font-semibold text-amber-400 mb-1 flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Paragraph Split Analysis
            </h6>
            <p className="text-muted-foreground text-[11px]">
              Splitting by paragraphs respects the author's logical topic blocks. It works brilliantly on structured markdown or documents with clear line breaks. However, note that if paragraphs are massive, you may exceed the token limits of your downstream embedding models.
            </p>
          </div>
        )}

        {strategy === "sliding" && (
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
            <h6 className="font-semibold text-cyan-400 mb-1 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Sliding Window Split Analysis
            </h6>
            <p className="text-muted-foreground text-[11px]">
              The window shifts word by word, creating high-density overlapping intervals. This produces excellent density vectors for cross-attention searches but increases the size of your database by generating {chunkCount} total chunks from a short document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
