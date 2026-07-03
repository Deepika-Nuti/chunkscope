"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, BookOpen, Sparkles, Award, RotateCcw, ShieldCheck, Flame, Compass } from "lucide-react";
import { useGamification } from "../../lib/useGamification";

interface LessonNode {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  xpValue: number;
}

const LESSONS: LessonNode[] = [
  { id: 1, slug: "why-rag", title: "Why RAG & Chunking?", subtitle: "Understanding Naive LLM limits & hallucination hazards", xpValue: 100 },
  { id: 2, slug: "chunking", title: "Document Chunking Strategies", subtitle: "Splitting raw layout strings into index segments", xpValue: 100 },
  { id: 3, slug: "overlap", title: "Overlap Buffer", subtitle: "Preserving context at boundaries", xpValue: 100 },
  { id: 4, slug: "embeddings", title: "Vector Embeddings", subtitle: "Calculating semantic coordinate metrics", xpValue: 100 },
  { id: 5, slug: "vector-db", title: "Vector Databases", subtitle: "Indexing coordinates with graph list topologies", xpValue: 100 },
  { id: 6, slug: "retrieval", title: "Retrieval Queries", subtitle: "Cosine similarity vector matching searches", xpValue: 100 },
  { id: 7, slug: "rag-pipeline", title: "Complete RAG Pipeline Simulator", subtitle: "Connecting parsing, database indexing, and LLM synthesis", xpValue: 200 },
];

const BADGES_LIST = [
  { id: "apprentice", name: "Chunk Apprentice", desc: "Unlock 100 XP", icon: ShieldCheck, color: "text-blue-400" },
  { id: "engineer", name: "Chunk Engineer", desc: "Unlock 300 XP", icon: Flame, color: "text-amber-400" },
  { id: "architect", name: "RAG Architect", desc: "Unlock 500 XP", icon: Compass, color: "text-emerald-400" },
  { id: "master", name: "Vector Master", desc: "Unlock 700 XP", icon: Award, color: "text-purple-400" },
  { id: "scientist", name: "Retrieval Scientist", desc: "Unlock 900 XP", icon: Sparkles, color: "text-pink-400" },
];

export default function LearnSyllabusPage() {
  const { xp, completedLessons, unlockedBadges, masteryLevel, resetGamification } = useGamification();

  // Next level threshold calculations
  const totalXpRequired = 1000;
  const progressPercent = Math.min(100, Math.round((xp / totalXpRequired) * 100));

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-10 px-6 space-y-10 animate-fade-in select-none">
      
      {/* 1. Header Profile & XP Progress */}
      <div className="glass-panel border border-border bg-card/45 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Profile Stats */}
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center border-2 border-border shadow-[0_0_15px_rgba(99,102,241,0.15)] text-foreground font-extrabold text-lg">
            {masteryLevel.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base text-foreground">RAG Explorer</span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                {masteryLevel}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">Learn RAG concepts through hands-on simulations</p>
          </div>
        </div>

        {/* Progress Circle/Bar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
            <span>XP: {xp} / {totalXpRequired}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-secondary/80 border border-border/60 rounded-full overflow-hidden">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-300"
            />
          </div>
        </div>

        <button
          onClick={resetGamification}
          className="absolute top-2 right-2 p-1 text-muted-foreground/30 hover:text-rose-400 hover:bg-rose-500/5 rounded transition-all cursor-pointer"
          title="Reset Course Progress"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 2. Syllabus roadmap & Achievements grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lessons Roadmap (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider block">
            Lessons Roadmap
          </span>

          <div className="space-y-3">
            {LESSONS.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.slug);
              
              // Lesson is unlocked if it's the first one, or if the previous lesson was completed
              const isUnlocked = idx === 0 || completedLessons.includes(LESSONS[idx - 1].slug);
              const isActive = isUnlocked && !isCompleted;

              return (
                <div key={lesson.id} className="relative">
                  {/* Connection line between lessons */}
                  {idx < LESSONS.length - 1 && (
                    <div className={`absolute left-6.5 top-14 w-0.5 h-6 z-0 ${
                      isCompleted ? "bg-emerald-500/50" : "bg-border/30"
                    }`} />
                  )}

                  <Link
                    href={isUnlocked ? `/learn/${lesson.slug}` : "#"}
                    onClick={(e) => !isUnlocked && e.preventDefault()}
                    className={`p-4 border rounded-2xl transition-all flex items-center justify-between gap-4 block relative z-10 ${
                      isActive 
                        ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-[0_4px_15px_rgba(99,102,241,0.08)] scale-[1.01] cursor-pointer" 
                        : isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                        : "border-border/25 bg-secondary/5 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5.5 w-5.5 text-emerald-400 fill-emerald-400/10" />
                        ) : (
                          <Circle className={`h-5.5 w-5.5 ${isActive ? "text-primary stroke-[2px]" : "text-muted-foreground/30"}`} />
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="text-[9px] font-mono text-muted-foreground/60 block uppercase font-bold">
                          LESSON {lesson.id} OF 7 • {lesson.xpValue} XP
                        </span>
                        <span className="font-extrabold text-[13px] text-foreground block pt-0.5">{lesson.title}</span>
                        <span className="text-[10px] text-muted-foreground/75 leading-normal mt-0.5 block">{lesson.subtitle}</span>
                      </div>
                    </div>

                    {isUnlocked && (
                      <ArrowRight className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-emerald-400"}`} />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Achievements & Badges (col-span-1) */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider block">
            Unlocked Badges ({unlockedBadges.length})
          </span>

          <div className="bg-secondary/15 border border-border p-4 rounded-2xl space-y-4">
            {BADGES_LIST.map((b) => {
              const isUnlocked = unlockedBadges.includes(b.id);
              const Icon = b.icon;

              return (
                <div 
                  key={b.id} 
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                    isUnlocked 
                      ? "border-primary/20 bg-primary/5 shadow-sm" 
                      : "border-border/30 bg-background/25 opacity-40"
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-background ${isUnlocked ? b.color : "text-zinc-600"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[11px] text-foreground block">{b.name}</span>
                    <span className="text-[9px] text-muted-foreground">{b.desc} • {isUnlocked ? "Unlocked" : "Locked"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
