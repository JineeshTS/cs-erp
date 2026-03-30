"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Anchor, Ship, Users, FileText, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: string;
  id: string;
  label: string;
  sublabel: string;
  href: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Search; color: string }> = {
  Port: { icon: Anchor, color: "bg-blue-100 text-blue-700" },
  Vessel: { icon: Ship, color: "bg-emerald-100 text-emerald-700" },
  Customer: { icon: Users, color: "bg-purple-100 text-purple-700" },
  Booking: { icon: Package, color: "bg-orange-100 text-orange-700" },
  Invoice: { icon: FileText, color: "bg-amber-100 text-amber-700" },
  "Bill of Lading": { icon: FileText, color: "bg-teal-100 text-teal-700" },
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  const searchApi = useCallback(async (term: string) => {
    if (term.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(term)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setResults(json.data || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length === 0) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchApi(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchApi]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex].href);
    }
  }

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {}
  );

  // Flatten for index tracking
  let flatIndex = 0;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        title="Search (Cmd+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-block">
          {typeof navigator !== "undefined" &&
          /Mac/.test(navigator.userAgent)
            ? "\u2318K"
            : "Ctrl+K"}
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg px-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search ports, vessels, customers, bookings..."
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            <button
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length > 0 && !loading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {type}s
                </div>
                {items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  const typeConf = TYPE_CONFIG[item.type] || {
                    icon: Search,
                    color: "bg-slate-100 text-slate-700",
                  };
                  const Icon = typeConf.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-brand-50 text-brand-900"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          typeConf.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {item.label}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {item.sublabel}
                        </div>
                      </div>
                      {isSelected && (
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
              <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">&uarr;&darr;</kbd>
                <span>navigate</span>
                <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">&crarr;</kbd>
                <span>open</span>
                <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">esc</kbd>
                <span>close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
