"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { FileMetadata, uploadDocument } from "../lib/api";
import { DEMO_DATASETS } from "../lib/demo-datasets";

interface DocumentUploadProps {
  onUploadSuccess: (metadata: FileMetadata) => void;
  isBackendOnline: boolean;
}

// Sample text for instant load
const SAMPLE_RAG_TEXT = `What is Retrieval-Augmented Generation (RAG)?
Retrieval-Augmented Generation (RAG) is a powerful pattern in AI development. It combines the reasoning capabilities of Large Language Models (LLMs) with custom, external data sources. Instead of relying solely on the LLM's pre-trained knowledge, a RAG system retrieves relevant facts from a dataset and appends them to the user's prompt. This drastically reduces hallucinations and ensures answers are grounded in real, updated data.

Why is Document Chunking Critical?
Chunking is the process of breaking down a large, continuous document into smaller, digestible segments (chunks) before they are converted into vector embeddings and stored in a vector database.
LLMs have strict context window limits (e.g., 8k, 32k, or 128k tokens). If you pass an entire 100-page PDF as context to answer a single question, you will incur massive API costs, slow response times, and exceed the LLM's context window. More importantly, research shows LLMs suffer from "lost in the middle" syndrome, where they fail to extract facts buried in the middle of long contexts.
By chunking, we store smaller, semantically coherent passages. When a query is made, we retrieve only the 3 or 5 most relevant chunks (e.g., 1,500 words total) rather than the whole document.

Understanding the Overlap Parameter
Most chunking algorithms use a parameter called 'overlap'. Overlap defines the number of characters or tokens shared between consecutive chunks.
For example, if Chunk Size is 500 characters and Overlap is 100 characters:
- Chunk 1 spans character index 0 to 500.
- Chunk 2 spans character index 400 to 900.
- Chunk 3 spans character index 800 to 1300.
The character range 400-500 is identical in both Chunk 1 and Chunk 2. This prevents a critical problem: semantic fragmentation. If a key fact is split exactly down the middle between two chunks, neither chunk will contain enough context to represent the idea, leading to poor embedding vector quality and failed retrievals. Overlap ensures that transitions, sentences, and contexts remain intact.

Overview of Chunking Strategies
1. Fixed Size Chunking:
This is the simplest form. You define a character or token limit and split the text every N units. It is computationally fast but completely ignores document structure, meaning it often cuts words or sentences in half.

2. Recursive Character Chunking:
This is the recommended default for general text. It uses a list of separators (like paragraphs, sentences, and words) to split the text progressively. It attempts to keep paragraphs together first, then sentences, and finally words, only splitting at character levels as a last resort.

3. Sentence Chunking:`;
export default function DocumentUpload({ onUploadSuccess, isBackendOnline }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    });

    try {
      const data = await uploadDocument(file);
      onUploadSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process document.");
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadDemo = (key: string) => {
    setError(null);
    const demo = DEMO_DATASETS[key];
    if (demo) {
      setFileInfo({
        name: demo.filename,
        size: (demo.file_size / 1024).toFixed(1) + " KB",
      });
      onUploadSuccess(demo);
    }
  };

  return (
    <div className="space-y-5">
      <div
        className={`glass-panel border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/45 bg-card"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-secondary/80 rounded-full border border-border">
            {loading ? (
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div>
            <p className="font-semibold text-sm">
              {loading ? "Processing Document..." : "Drag & drop your document here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, DOCX, TXT, or Markdown
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/70 border border-border cursor-pointer transition-all disabled:opacity-50"
          >
            Browse Files
          </button>

          {!isBackendOnline && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium">
              <AlertCircle className="h-3 w-3" />
              <span>Offline Mode: TXT & MD only</span>
            </div>
          )}
        </div>
      </div>

      {/* Built-in Demo Library Section */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Or Load Built-in Demo Library
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
          {[
            { key: "research_paper.pdf", label: "Attention Research Paper", type: "PDF" },
            { key: "legal_contract.pdf", label: "Mutual NDA Agreement", type: "PDF" },
            { key: "medical_report.pdf", label: "Cardiology Consult", type: "PDF" },
            { key: "wikipedia_article.md", label: "RAG Wikipedia Summary", type: "MD" },
            { key: "python_documentation.txt", label: "Python Decorators", type: "TXT" },
          ].map((demo) => (
            <button
              key={demo.key}
              onClick={() => handleLoadDemo(demo.key)}
              disabled={loading}
              className="p-2 border border-border bg-secondary/35 rounded-lg hover:border-primary/50 text-left font-medium transition-all hover:bg-secondary/50 cursor-pointer disabled:opacity-50 truncate flex justify-between items-center"
            >
              <span className="truncate">{demo.label}</span>
              <span className="text-[8px] bg-background border border-border rounded px-1 text-muted-foreground shrink-0 font-mono">
                {demo.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {fileInfo && !error && (
        <div className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg text-xs">
          <div className="flex items-center space-x-2 overflow-hidden">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium truncate">{fileInfo.name}</span>
            <span className="text-[10px] text-muted-foreground">({fileInfo.size})</span>
          </div>
          <div className="flex items-center text-emerald-500 font-medium shrink-0">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Loaded
          </div>
        </div>
      )}
    </div>
  );
}
