"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Search } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxItems?: number;
  className?: string;
}

/**
 * MultiSelect — select multiple values from a searchable list.
 * Shows selected items as removable tags.
 * Used for: trade lane port selections, report filters, permission lists.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  disabled = false,
  maxItems,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as MultiSelectOption[];

  const filtered = options.filter(
    (o) =>
      !value.includes(o.value) &&
      (o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.value.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addItem(val: string) {
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, val]);
    setSearch("");
  }

  function removeItem(val: string) {
    onChange(value.filter((v) => v !== val));
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Tags + input */}
      <div
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus(); } }}
        className={cn(
          "flex min-h-[40px] w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 transition-colors",
          "dark:border-gray-700 dark:bg-gray-900",
          open && "ring-2 ring-brand-500/30 border-brand-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {selectedLabels.map((item) => (
          <span
            key={item.value}
            className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
          >
            {item.label}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeItem(item.value); }}
                className="hover:text-brand-900 dark:hover:text-brand-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selectedLabels.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="min-w-[80px] flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-gray-100"
        />
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400 dark:text-gray-500">
                {search ? "No matches" : "All items selected"}
              </li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => addItem(option.value)}
                  className="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800"
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

// ── TagInput ────────────────────────────────────────────────────

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * TagInput — free-form tag entry with Enter key.
 * Used for: keywords, EDI message routing tags, custom labels.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  disabled = false,
  className,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  }

  return (
    <div
      className={cn(
        "flex min-h-[40px] w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1",
        "dark:border-gray-700 dark:bg-gray-900",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {tag}
          {!disabled && (
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
              <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !input && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="min-w-[80px] flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-gray-100"
      />
    </div>
  );
}
