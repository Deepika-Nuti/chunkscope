"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Sparkles, Activity } from "lucide-react";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dark h-screen bg-[#030303] text-foreground font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between h-[64px] shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-85">
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              ChunkScope Learn
            </span>
          </Link>
          <span className="text-[9px] bg-primary/15 border border-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
            Interactive Course
          </span>
        </div>

        {/* Lesson Links */}
        <nav className="hidden md:flex items-center space-x-1 text-xs">
          {[
            { path: "/learn", label: "Syllabus" },
            { path: "/learn/why-rag", label: "1. Why RAG?" },
            { path: "/learn/chunking", label: "2. Chunking" },
            { path: "/learn/overlap", label: "3. Overlap" },
            { path: "/learn/embeddings", label: "4. Embeddings" },
          ].map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Go to Lab Redirect */}
        <div className="flex items-center space-x-3">
          <Link
            href="/lab/chunking"
            className="text-[10px] bg-secondary border border-border px-3 py-1.5 rounded-lg font-extrabold cursor-pointer hover:bg-secondary/80 flex items-center space-x-1.5 transition-all text-primary"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Go to RAG Lab</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        {children}
      </div>

      {/* Footer bar */}
      <footer className="border-t border-border/40 py-4 text-center text-[9px] text-muted-foreground/60">
        Google DeepMind RAG Educational Simulator Series • Phase 2
      </footer>
    </div>
  );
}
