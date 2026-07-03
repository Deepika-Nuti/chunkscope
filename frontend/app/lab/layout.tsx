"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, GitFork, Library, BookOpen } from "lucide-react";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dark h-screen bg-[#030303] text-foreground font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="border-b border-border bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between h-[64px] shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-85">
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              ChunkScope Lab
            </span>
          </Link>
          <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            RAG OS
          </span>
        </div>

        {/* Sub Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1.5 text-[11px] font-semibold text-muted-foreground">
          {[
            { path: "/lab/chunking", label: "Chunking" },
            { path: "/lab/embeddings", label: "Embeddings" },
            { path: "/lab/vector-db", label: "Vector DB" },
            { path: "/lab/retrieval", label: "Retrieval" },
            { path: "/lab/simulator", label: "RAG Simulator" },
            { path: "/lab/practice", label: "Practice Lab" },
            { path: "/lab/evaluation", label: "Evaluation" },
          ].map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-md hover:text-foreground cursor-pointer transition-all ${
                  isActive ? "bg-secondary text-primary border border-border/80 shadow-sm" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Go to Course Redirect */}
        <div className="flex items-center space-x-3">
          <Link
            href="/learn"
            className="text-[10px] bg-secondary border border-border px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-secondary/80 flex items-center space-x-1.5 transition-all text-violet-400"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Switch to Course</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-[9px] text-muted-foreground/60">
        RAG Optimization Workbench Platform v2.0
      </footer>
    </div>
  );
}
