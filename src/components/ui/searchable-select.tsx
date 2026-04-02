"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X, Loader2, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  /** Lookup entity name for server-side search (e.g., "ports", "vessels") */
  entity?: string;
  /** Static options (used when entity is not provided) */
  options?: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Additional className */
  className?: string;
  /** Field name for forms */
  name?: string;
}

/**
 * SearchableSelect — async-searchable dropdown for master data lookups.
 *
 * Two modes:
 * - entity="ports" → fetches from /api/v1/lookups/ports?q=term (server-side search)
 * - options=[...] → filters static options client-side (for small lists like status enums)
 */
export function SearchableSelect({
  entity,
  options: staticOptions,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  required = false,
  className,
  name,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SelectOption[]>(staticOptions || []);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Find selected option label
  const selectedLabel = options.find((o) => o.value === value)?.label
    || staticOptions?.find((o) => o.value === value)?.label
    || value;

  // Fetch options from server
  const fetchOptions = useCallback(
    async (q: string) => {
      if (!entity) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/lookups/${entity}?q=${encodeURIComponent(q)}&limit=20`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setOptions(json.data || []);
        }
      } catch {
        // Silent fail — keep current options
      } finally {
        setLoading(false);
      }
    },
    [entity]
  );

  // Debounced search for server-side mode
  useEffect(() => {
    if (!entity || !open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOptions(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, entity, open, fetchOptions]);

  // Load initial options when opening
  useEffect(() => {
    if (open && entity && options.length === 0) {
      fetchOptions("");
    }
  }, [open, entity, options.length, fetchOptions]);

  // Client-side filter for static options
  const filteredOptions = entity
    ? options
    : (staticOptions || []).filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase())
      );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightIndex].value);
          setOpen(false);
          setSearch("");
        }
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setHighlightIndex(-1);
            if (!open) setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-brand-500/30 border-brand-500"
        )}
      >
        <span className={cn("truncate", !value && "text-slate-400 dark:text-gray-500")}>
          {value ? selectedLabel : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearch("");
              }}
              className="rounded-full p-0.5 hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-800">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
          </div>

          {/* Options list */}
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400 dark:text-gray-500">
                {loading ? "Searching..." : "No results found"}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm transition-colors",
                    option.value === value
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                      : "text-slate-700 dark:text-gray-300",
                    index === highlightIndex && "bg-slate-50 dark:bg-gray-800"
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
