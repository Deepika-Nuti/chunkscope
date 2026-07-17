"use client";

import React from "react";
import { AlertCircle, RefreshCw, Terminal, ArrowRight, ServerCrash } from "lucide-react";

interface ErrorStateProps {
  type: "offline" | "upload" | "embedding";
  message?: string;
  onRetry: () => void;
  onContinueOffline?: () => void;
}

export default function ErrorState({
  type,
  message,
  onRetry,
  onContinueOffline,
}: ErrorStateProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-md w-full mx-auto space-y-5 select-none shadow-xl text-xs leading-normal font-sans">
      
      {/* Header Diagnostic */}
      <div className="flex items-center space-x-2.5 pb-2 border-b border-rose-500/20 text-rose-400">
        <ServerCrash className="h-5 w-5 animate-bounce" />
        <span className="font-extrabold uppercase tracking-wider text-[10px]">
          {type === "offline" ? "Backend API Connection Offline" : type === "upload" ? "Document Upload Failed" : "Embedding Vector Pipeline Error"}
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-zinc-300 font-medium">
          {message || (type === "offline" 
            ? "ChunkScope could not establish a connection to the local FastAPI python server." 
            : "An unexpected error occurred during processing.")}
        </p>

        {type === "offline" && (
          <div className="space-y-2.5 bg-black/40 border border-border p-3.5 rounded-xl">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
              <Terminal className="h-3.5 w-3.5 mr-1" />
              Resolutions: Start your local backend API
            </span>
            <p className="text-[10px] text-muted-foreground">
              Run this command in your project root terminal to launch the python FastAPI server:
            </p>
            <pre className="p-2 bg-secondary text-[10.5px] font-mono text-primary rounded-lg border border-border select-all">
              python run.py
            </pre>
            <p className="text-[9.5px] text-muted-foreground/60 leading-normal">
              Alternatively, make sure the API port 8000 is open and not blocked by active firewalls.
            </p>
          </div>
        )}

        {type === "upload" && (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[10px] pl-1">
            <li>Check if the file format is supported (.pdf, .docx, .txt, .md).</li>
            <li>Confirm the file size does not exceed 10 MB.</li>
            <li>Ensure the file is not password-protected or corrupted.</li>
          </ul>
        )}

        {type === "embedding" && (
          <p className="text-[10px] text-muted-foreground">
            The embedding generator timed out or failed. This typically happens when processing large documents under heavy local load, or if your python server lacks GPU capabilities.
          </p>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-rose-500/10">
        {onContinueOffline && type === "offline" && (
          <button
            onClick={onContinueOffline}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/70 border border-border text-muted-foreground hover:text-foreground font-semibold rounded-xl cursor-pointer transition-all flex items-center space-x-1"
          >
            <span>Continue Offline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          onClick={onRetry}
          className="px-4 py-1.5 bg-rose-500 text-white font-extrabold rounded-xl cursor-pointer hover:bg-rose-600 transition-all flex items-center space-x-1.5 shadow-md shadow-rose-950/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
