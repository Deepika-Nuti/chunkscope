"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Settings, Eye, Trash2, FileText, ArrowRight, CornerDownLeft } from "lucide-react";
import { DEMO_DATASETS } from "../lib/demo-datasets";
import { FileMetadata } from "../lib/api";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStrategy: (strat: string) => void;
  onToggleExplainMode: () => void;
  onClearDocument: () => void;
  onLoadDemo: (meta: FileMetadata) => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectStrategy,
  onToggleExplainMode,
  onClearDocument,
  onLoadDemo,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const commands: CommandItem[] = [
    // Strategies
    {
      id: "strat-fixed",
      category: "Strategies",
      title: "Switch to Fixed Size Chunking",
      subtitle: "Split text strictly by character count limit",
      icon: <Settings className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectStrategy("fixed");
        onClose();
      },
    },
    {
      id: "strat-recursive",
      category: "Strategies",
      title: "Switch to Recursive Character Chunking",
      subtitle: "Recommended splitter respecting layout/separators",
      icon: <Settings className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectStrategy("recursive");
        onClose();
      },
    },
    {
      id: "strat-sentence",
      category: "Strategies",
      title: "Switch to Sentence Chunking",
      subtitle: "Group atomic thoughts by full sentence breaks",
      icon: <Settings className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectStrategy("sentence");
        onClose();
      },
    },
    {
      id: "strat-paragraph",
      category: "Strategies",
      title: "Switch to Paragraph Chunking",
      subtitle: "Keep logical paragraphs together (double newline)",
      icon: <Settings className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectStrategy("paragraph");
        onClose();
      },
    },
    {
      id: "strat-sliding",
      category: "Strategies",
      title: "Switch to Sliding Window Chunking",
      subtitle: "Continuous word scans with overlapping strides",
      icon: <Settings className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectStrategy("sliding");
        onClose();
      },
    },
    // Settings
    {
      id: "toggle-explain",
      category: "Settings",
      title: "Toggle Explain mode",
      subtitle: "Show/hide educational overlays and guides",
      icon: <Eye className="h-4 w-4 text-amber-400" />,
      action: () => {
        onToggleExplainMode();
        onClose();
      },
    },
    {
      id: "clear-doc",
      category: "Settings",
      title: "Clear loaded document",
      subtitle: "Unload current file and reset playground",
      icon: <Trash2 className="h-4 w-4 text-rose-400" />,
      action: () => {
        onClearDocument();
        onClose();
      },
    },
    // Demo datasets
    {
      id: "demo-paper",
      category: "Demo Datasets",
      title: "Load Attention Research Paper",
      subtitle: "Technical abstract from Transformer paper (PDF)",
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      action: () => {
        onLoadDemo(DEMO_DATASETS["research_paper.pdf"]);
        onClose();
      },
    },
    {
      id: "demo-nda",
      category: "Demo Datasets",
      title: "Load NDA Legal Contract",
      subtitle: "Standard terms and confidentiality exclusion clauses (PDF)",
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      action: () => {
        onLoadDemo(DEMO_DATASETS["legal_contract.pdf"]);
        onClose();
      },
    },
    {
      id: "demo-medical",
      category: "Demo Datasets",
      title: "Load Cardiology Medical Report",
      subtitle: "Clinical diagnostics and stress test stats (PDF)",
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      action: () => {
        onLoadDemo(DEMO_DATASETS["medical_report.pdf"]);
        onClose();
      },
    },
    {
      id: "demo-wikipedia",
      category: "Demo Datasets",
      title: "Load RAG Wikipedia Article",
      subtitle: "Summary of indexing and semantic lookups (Markdown)",
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      action: () => {
        onLoadDemo(DEMO_DATASETS["wikipedia_article.md"]);
        onClose();
      },
    },
    {
      id: "demo-python",
      category: "Demo Datasets",
      title: "Load Python Decorator Documentation",
      subtitle: "Closures syntax and decorator use cases (TXT)",
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      action: () => {
        onLoadDemo(DEMO_DATASETS["python_documentation.txt"]);
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-background/55 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="w-full max-w-lg glass-panel bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col text-xs max-h-[380px] animate-fade-in"
      >
        {/* Search input bar */}
        <div className="p-3 border-b border-border flex items-center space-x-2.5 shrink-0 bg-secondary/10">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search demo files..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-foreground text-xs placeholder-muted-foreground/60"
          />
          <span className="text-[9px] bg-secondary/80 border border-border px-1.5 py-0.5 rounded text-muted-foreground font-mono">
            ESC
          </span>
        </div>

        {/* Action Commands list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-[10px]">
              No command or demo document matches your query.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-1 bg-background rounded-md border border-border shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold block text-foreground">{cmd.title}</span>
                      <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
                        {cmd.subtitle}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <span className="text-[9px] bg-background border border-border px-1 py-0.5 rounded text-muted-foreground font-mono flex items-center">
                      <CornerDownLeft className="h-3 w-3 mr-0.5" />
                      ENTER
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
