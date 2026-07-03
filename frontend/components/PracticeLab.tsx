"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, CheckCircle2, ShieldAlert, Award, FileText, Code, GraduationCap } from "lucide-react";
import { useGamification } from "../lib/useGamification";
import { motion, AnimatePresence } from "framer-motion";

interface Challenge {
  id: string;
  name: string;
  desc: string;
  expertConfig: { strategy: string; size: number; overlap: number };
  expertReason: string;
  icon: any;
}

const CHALLENGES: Challenge[] = [
  {
    id: "legal",
    name: "Legal Contracts",
    desc: "Preserve deep nested clauses, terms, and liability exclusions without slicing transitions.",
    expertConfig: { strategy: "paragraph", size: 800, overlap: 150 },
    expertReason: "Paragraph strategies respect author clauses. Large size (800) and high overlap (150) prevent liability terms from getting split across documents.",
    icon: FileText,
  },
  {
    id: "medical",
    name: "Medical Records",
    desc: "Isolate clinical observations, medication dosages, and specific patient facts cleanly.",
    expertConfig: { strategy: "sentence", size: 300, overlap: 60 },
    expertReason: "Sentence strategies ensure facts are kept complete. Smaller sizes (300) keep retrieval precise, avoiding noise from unrelated clinical logs.",
    icon: GraduationCap,
  },
  {
    id: "code",
    name: "Source Code Files",
    desc: "Preserve bracket scopes, function syntax boundaries, and code structures.",
    expertConfig: { strategy: "recursive", size: 600, overlap: 0 },
    expertReason: "Recursive character chunking treats brackets ('{', '}') as delimiters. Overlaps are kept at 0 to prevent redundant compilation noise.",
    icon: Code,
  },
];

export default function PracticeLab() {
  const { addXp, unlockBadge } = useGamification();
  const [activeChallengeId, setActiveChallengeId] = useState("legal");
  
  // User configs
  const [strategy, setStrategy] = useState("fixed");
  const [size, setSize] = useState(400);
  const [overlap, setOverlap] = useState(50);

  // States
  const [score, setScore] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const activeChallenge = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  const handleVerify = () => {
    // Score calculation matching similarity to expert
    const target = activeChallenge.expertConfig;
    
    let penalty = 0;
    
    // Strategy penalty
    if (strategy !== target.strategy) {
      penalty += 35;
    }
    
    // Size distance penalty
    const sizeDiff = Math.abs(size - target.size);
    penalty += Math.min(30, sizeDiff / 15);

    // Overlap distance penalty
    const overlapDiff = Math.abs(overlap - target.overlap);
    penalty += Math.min(25, overlapDiff / 5);

    const calculatedScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
    setScore(calculatedScore);
    setIsRevealed(true);

    if (calculatedScore >= 80) {
      setUnlockedSuccess(true);
      addXp(100);
      unlockBadge("engineer");
    } else {
      setUnlockedSuccess(false);
    }
  };

  const handleNextChallenge = (id: string) => {
    setActiveChallengeId(id);
    setScore(null);
    setIsRevealed(false);
    setUnlockedSuccess(false);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border bg-card/45 space-y-6 select-none relative">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-primary font-mono tracking-widest block uppercase">
            Optimization Arena
          </span>
          <span className="text-xs font-semibold text-foreground">
            Practice Lab: Optimize Chunking Strategies
          </span>
        </div>
        <Trophy className="h-5 w-5 text-amber-400 animate-bounce" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 p-0.5 bg-secondary/30 border border-border rounded-lg text-xs font-semibold">
        {CHALLENGES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => handleNextChallenge(c.id)}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                activeChallengeId === c.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div className="p-4 bg-[#020204] border border-border rounded-xl text-xs space-y-1.5 font-sans leading-relaxed">
        <span className="font-extrabold text-[10px] uppercase font-mono text-primary">SCENARIO</span>
        <p className="text-zinc-300 font-semibold">{activeChallenge.desc}</p>
      </div>

      {/* Inputs vs Diagnostic display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-normal">
        {/* User slider panel */}
        <div className="space-y-4 bg-secondary/10 p-4 border border-border/60 rounded-xl">
          <span className="text-[8px] font-mono text-muted-foreground uppercase block font-bold">CONFIGURE CHUNK SETTINGS</span>
          
          <div className="space-y-3">
            {/* Strategy */}
            <div className="space-y-1.5">
              <span className="font-semibold text-muted-foreground">Select Strategy</span>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg p-2 outline-none text-foreground cursor-pointer font-mono"
              >
                <option value="fixed">Fixed Size Chunking</option>
                <option value="recursive">Recursive Character</option>
                <option value="sentence">Sentence Chunking</option>
                <option value="paragraph">Paragraph Chunking</option>
                <option value="sliding">Sliding Window</option>
              </select>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Chunk Size</span>
                <span className="font-mono text-primary">{size} chars</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Overlap */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Overlap size</span>
                <span className="font-mono text-primary">{overlap} chars</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={overlap}
                onChange={(e) => setOverlap(parseInt(e.target.value))}
                className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full py-2 bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/95 rounded-lg cursor-pointer font-extrabold text-[10.5px] transition-all shadow-sm"
            >
              Verify Optimization
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4 flex flex-col justify-center">
          {score !== null ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Score Dial */}
                <div className="text-center p-4 bg-secondary/20 border border-border/80 rounded-xl space-y-1">
                  <span className="text-[8px] font-mono text-muted-foreground uppercase block font-bold">ACCURACY SCORE</span>
                  <span className={`text-3xl font-extrabold ${unlockedSuccess ? "text-emerald-400" : "text-amber-400"}`}>
                    {score}%
                  </span>
                  <p className="text-[9.5px] text-muted-foreground pt-1">
                    {unlockedSuccess
                      ? "✓ Success! Optimization requirements satisfied. Earned +100 XP!"
                      : "✗ Optimization fails. Tweak sliders closer to expert profiles and try again."}
                  </p>
                </div>

                {/* Expert config reveal */}
                {isRevealed && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10.5px] space-y-2 leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground block uppercase text-[8px] tracking-wider text-primary">EXPERT PROFILE SUMMARY</span>
                    <div>
                      Strategy: <b className="text-foreground capitalize">{activeChallenge.expertConfig.strategy}</b> | Size: <b className="text-foreground">{activeChallenge.expertConfig.size}</b> | Overlap: <b className="text-foreground">{activeChallenge.expertConfig.overlap}</b>
                    </div>
                    <p className="text-[10px] italic">
                      " {activeChallenge.expertReason} "
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 text-zinc-500 italic space-y-1">
              <Award className="h-7 w-7 text-muted-foreground/30 animate-pulse" />
              <span className="text-[10px]">Tweak parameters and click verify to test your strategy.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
