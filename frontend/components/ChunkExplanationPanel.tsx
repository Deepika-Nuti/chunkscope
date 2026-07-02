"use client";

import React, { useMemo } from "react";
import { Chunk } from "../lib/fallback-engine";
import { CheckCircle2, AlertCircle, Bookmark, ShieldAlert, Sparkles } from "lucide-react";

interface ChunkExplanationPanelProps {
  chunk: Chunk;
  strategy: string;
  chunkSizeSetting?: number;
  overlapSetting?: number;
}

export default function ChunkExplanationPanel({
  chunk,
  strategy,
  chunkSizeSetting = 500,
  overlapSetting = 100,
}: ChunkExplanationPanelProps) {
  // Analyze chunk text and boundaries to evaluate the split triggers
  const splitTriggers = useMemo(() => {
    const text = chunk.text;
    const isFixed = strategy === "fixed";
    const isRecursive = strategy === "recursive";
    const isSentence = strategy === "sentence";
    const isParagraph = strategy === "paragraph";
    const isSliding = strategy === "sliding";

    // Heuristics
    const endsWithParagraphBreak = text.endsWith("\n\n") || text.endsWith("\r\n\r\n");
    const endsWithNewline = text.endsWith("\n") && !endsWithParagraphBreak;
    const endsWithPunctuation = /[.!?]$/.test(text.trim());
    
    // Check if chunk is at capacity limit
    const isAtCharLimit = chunk.char_count >= chunkSizeSetting - 15;
    const hasOverlap = chunk.overlap_prev > 0 || chunk.overlap_next > 0;

    return {
      maxSizeReached: isFixed || (isRecursive && isAtCharLimit) || isSliding,
      sentenceBoundary: isSentence || (isRecursive && endsWithPunctuation),
      paragraphSeparator: isParagraph || (isRecursive && endsWithParagraphBreak),
      overlapPreserved: hasOverlap && (isFixed || isRecursive || isSliding),
      tokenLimitExceeded: isFixed || isSliding || (isRecursive && chunk.token_count > chunkSizeSetting / 4),
    };
  }, [chunk, strategy, chunkSizeSetting]);

  // Strategy explanation details
  const educationContent = useMemo(() => {
    switch (strategy.toLowerCase()) {
      case "fixed":
        return {
          what: "Fixed Character Splitting",
          why: "Splits text exactly every N characters (configured chunk size) without inspecting document syntax or structure.",
          benefits: "Fast and uniform. Easy to compute and guarantees that downstream embedding arrays have a uniform size distribution.",
          drawbacks: "Highly prone to cutting words, code syntax, and sentences exactly in half. Destroys the sentence readability.",
          rag: "Often leads to poor retrieval similarity scores because chopped words represent broken concept coordinates in the vector database."
        };
      case "recursive":
        return {
          what: "Recursive Separation Splitting",
          why: "Splits the text incrementally by evaluating paragraph breaks, single line breaks, spaces, and individual characters in order.",
          benefits: "Retains syntactic integrity. Paragraphs are kept together as semantic blocks, falling back to sentences only when size constraints require it.",
          drawbacks: "Can lead to variable chunk sizes depending on layout, and parsing is slightly slower than character slicing.",
          rag: "Highly recommended standard for RAG. Preserves document structure and maintains excellent semantic continuity for embedding search."
        };
      case "sentence":
        return {
          what: "Sentence Boundary Splitting",
          why: "Identifies sentence boundaries (punctuations followed by spaces) and groups complete sentence structures together.",
          benefits: "Never breaks an individual thought or sentence, ensuring that each chunk makes complete linguistic sense.",
          drawbacks: "Subject to formatting errors (e.g. periods after abbreviations like 'Dr.' or 'e.g.' can trigger false splits).",
          rag: "Excellent for dense QA retrieval. However, can lead to highly variable chunk sizes if the text has massive run-on sentences."
        };
      case "paragraph":
        return {
          what: "Paragraph Separation Splitting",
          why: "Splits text at double newlines, packaging complete paragraphs as standalone context pieces.",
          benefits: "Preserves topical alignment. Authors write paragraphs as unified ideas, which prevents cross-topic contamination.",
          drawbacks: "Fails if document formatting does not utilize double-newline spaces, or if single paragraphs are larger than the LLM context window.",
          rag: "Perfect for manuals or academic papers where paragraphs represent complete arguments. Wastes zero storage space due to 0% overlap."
        };
      case "sliding":
        return {
          what: "Sliding Word Window Splitting",
          why: "Slides a fixed window of words by a stride size, capturing dense, continuous word sequences.",
          benefits: "Prevents any loss of context by creating massive overlapping windows across the document.",
          drawbacks: "Extremely redundant. Storing overlap segments repeatedly bloats the database size and increases cost.",
          rag: "Great for keyword lookup where search terms must align, but increases vector database storage fees significantly."
        };
      default:
        return {
          what: "Unknown Splitting Strategy",
          why: "No strategy explanation found.",
          benefits: "",
          drawbacks: "",
          rag: ""
        };
    }
  }, [strategy]);

  return (
    <div className="space-y-4">
      {/* 1. Splitting Triggers checklist */}
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-xl space-y-2">
        <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
          <Sparkles className="h-3.5 w-3.5 mr-1 text-primary animate-pulse" />
          Boundary Split Triggers
        </h5>
        
        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${splitTriggers.maxSizeReached ? "text-primary" : "text-muted-foreground/30"}`} />
            <span className={splitTriggers.maxSizeReached ? "text-foreground" : "text-muted-foreground/40"}>Max size limit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${splitTriggers.sentenceBoundary ? "text-primary" : "text-muted-foreground/30"}`} />
            <span className={splitTriggers.sentenceBoundary ? "text-foreground" : "text-muted-foreground/40"}>Sentence break</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${splitTriggers.paragraphSeparator ? "text-primary" : "text-muted-foreground/30"}`} />
            <span className={splitTriggers.paragraphSeparator ? "text-foreground" : "text-muted-foreground/40"}>Paragraph separator</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${splitTriggers.overlapPreserved ? "text-primary" : "text-muted-foreground/30"}`} />
            <span className={splitTriggers.overlapPreserved ? "text-foreground" : "text-muted-foreground/40"}>Overlap protection</span>
          </div>
          <div className="flex items-center space-x-1.5 col-span-2">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${splitTriggers.tokenLimitExceeded ? "text-primary" : "text-muted-foreground/30"}`} />
            <span className={splitTriggers.tokenLimitExceeded ? "text-foreground" : "text-muted-foreground/40"}>Token threshold met</span>
          </div>
        </div>
      </div>

      {/* 2. Educational Breakdown */}
      <div className="space-y-3.5 text-[11px] leading-relaxed">
        <div>
          <span className="font-bold text-foreground block mb-0.5">Split Mechanics: {educationContent.what}</span>
          <p className="text-muted-foreground">{educationContent.why}</p>
        </div>
        <div>
          <span className="font-bold text-emerald-400 block mb-0.5">Advantages:</span>
          <p className="text-muted-foreground">{educationContent.benefits}</p>
        </div>
        <div>
          <span className="font-bold text-rose-400 block mb-0.5">Disadvantages:</span>
          <p className="text-muted-foreground">{educationContent.drawbacks}</p>
        </div>
        <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg">
          <span className="font-bold text-indigo-400 block mb-0.5">RAG System Implications:</span>
          <p className="text-muted-foreground">{educationContent.rag}</p>
        </div>
      </div>
    </div>
  );
}
