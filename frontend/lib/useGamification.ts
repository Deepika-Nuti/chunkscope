"use client";

import { useState, useEffect } from "react";

export interface GamificationState {
  xp: number;
  completedLessons: string[];
  unlockedBadges: string[];
}

export function useGamification() {
  const [state, setState] = useState<GamificationState>({
    xp: 0,
    completedLessons: [],
    unlockedBadges: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chunkscope_gamification");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse gamification state", e);
      }
    }
  }, []);

  const saveState = (newState: GamificationState) => {
    setState(newState);
    localStorage.setItem("chunkscope_gamification", JSON.stringify(newState));
  };

  const completeLesson = (slug: string, xpEarned: number) => {
    if (state.completedLessons.includes(slug)) return;
    
    const newLessons = [...state.completedLessons, slug];
    const newXp = state.xp + xpEarned;
    const newBadges = [...state.unlockedBadges];

    // Check badge thresholds
    if (newXp >= 100 && !newBadges.includes("apprentice")) {
      newBadges.push("apprentice");
    }
    if (newXp >= 300 && !newBadges.includes("engineer")) {
      newBadges.push("engineer");
    }
    if (newXp >= 500 && !newBadges.includes("architect")) {
      newBadges.push("architect");
    }
    if (newXp >= 700 && !newBadges.includes("master")) {
      newBadges.push("master");
    }
    if (newXp >= 900 && !newBadges.includes("scientist")) {
      newBadges.push("scientist");
    }

    saveState({
      xp: newXp,
      completedLessons: newLessons,
      unlockedBadges: newBadges,
    });
  };

  const unlockBadge = (badgeId: string) => {
    if (state.unlockedBadges.includes(badgeId)) return;
    saveState({
      ...state,
      unlockedBadges: [...state.unlockedBadges, badgeId],
    });
  };

  const addXp = (amount: number) => {
    const newXp = state.xp + amount;
    const newBadges = [...state.unlockedBadges];
    if (newXp >= 100 && !newBadges.includes("apprentice")) newBadges.push("apprentice");
    if (newXp >= 300 && !newBadges.includes("engineer")) newBadges.push("engineer");
    if (newXp >= 500 && !newBadges.includes("architect")) newBadges.push("architect");
    if (newXp >= 700 && !newBadges.includes("master")) newBadges.push("master");
    if (newXp >= 900 && !newBadges.includes("scientist")) newBadges.push("scientist");

    saveState({
      ...state,
      xp: newXp,
      unlockedBadges: newBadges,
    });
  };

  const resetGamification = () => {
    saveState({
      xp: 0,
      completedLessons: [],
      unlockedBadges: [],
    });
  };

  const getMasteryLevel = () => {
    if (state.xp >= 900) return "Retrieval Scientist";
    if (state.xp >= 700) return "Vector Master";
    if (state.xp >= 500) return "RAG Architect";
    if (state.xp >= 300) return "Chunk Engineer";
    if (state.xp >= 100) return "Chunk Apprentice";
    return "Apprentice";
  };

  return {
    xp: state.xp,
    completedLessons: state.completedLessons,
    unlockedBadges: state.unlockedBadges,
    completeLesson,
    unlockBadge,
    addXp,
    resetGamification,
    masteryLevel: getMasteryLevel(),
  };
}
