"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface LessonNode {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "locked";
}

const LESSONS: LessonNode[] = [
  { id: 1, slug: "why-rag", title: "Why RAG?", subtitle: "Understanding Naive LLM limits & hallucination risks", status: "completed" },
  { id: 2, slug: "chunking", title: "Document Chunking", subtitle: "Splitting raw layout strings into index segments", status: "active" },
  { id: 3, slug: "overlap", title: "Overlap Buffer", subtitle: "Preserving context at boundaries", status: "locked" },
  { id: 4, slug: "embeddings", title: "Vector Embeddings", subtitle: "Calculating semantic coordinate metrics", status: "locked" },
  { id: 5, slug: "vector-db", title: "Vector Databases", subtitle: "Indexing coordinates with HNSW graph lists", status: "locked" },
  { id: 6, slug: "retrieval", title: "Retrieval Queries", subtitle: "Cosine similarity vector matching searches", status: "locked" },
  { id: 7, slug: "rag-pipeline", title: "Complete RAG Pipeline", subtitle: "Connecting parsing, database, and LLM prompting", status: "locked" },
];

export default function LearnSyllabusPage() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto py-12 px-6 space-y-10">
      
      {/* Brand header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <BookOpen className="h-3.5 w-3.5" />
          <span>ChunkScope Syllabus</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Your RAG Learning Journey
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Learn how Retrieval-Augmented Generation handles custom contexts through interactive, visual storyboards.
        </p>
      </div>

      {/* Lesson Roadmap list */}
      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const isCompleted = lesson.status === "completed";
          const isActive = lesson.status === "active";
          
          return (
            <Link
              key={lesson.id}
              href={`/learn/${lesson.slug}`}
              className={`p-4 border rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 block ${
                isActive 
                  ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-[0_4px_15px_rgba(99,102,241,0.08)] scale-[1.01]" 
                  : isCompleted
                  ? "border-border/60 bg-secondary/10 hover:bg-secondary/20 opacity-80"
                  : "border-border/30 bg-secondary/5 opacity-55 hover:opacity-75"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isActive ? "text-primary stroke-[2px]" : "text-muted-foreground/30"}`} />
                  )}
                </div>
                <div className="text-xs">
                  <span className="text-[9px] font-mono text-muted-foreground/60 block uppercase font-bold">
                    LESSON {lesson.id} OF 7
                  </span>
                  <span className="font-extrabold text-[13px] text-foreground block pt-0.5">{lesson.title}</span>
                  <span className="text-[10px] text-muted-foreground/75 leading-normal mt-0.5 block">{lesson.subtitle}</span>
                </div>
              </div>

              <ArrowRight className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
