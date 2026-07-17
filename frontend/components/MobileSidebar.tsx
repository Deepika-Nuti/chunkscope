"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  title = "Dissection Parameters",
  children,
}: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Drawer Slide-in from Right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative ml-auto max-w-sm w-full h-full bg-card border-l border-border shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border/40 shrink-0 bg-secondary/20">
              <span className="text-xs font-bold text-foreground flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-primary animate-pulse" />
                <span>{title}</span>
              </span>
              <button
                onClick={onClose}
                className="p-1 hover:text-primary transition-all rounded hover:bg-secondary cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Close parameters panel drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Contents Scroll */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
