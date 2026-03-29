"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// ── DatePicker ──────────────────────────────────────────────────

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  type?: "date" | "datetime-local";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  name?: string;
}

const INPUT_CLASSES = cn(
  "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors",
  "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
);

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  // Handle both "2024-03-15" and "2024-03-15T10:30" formats
  const d = value.includes("T")
    ? new Date(value)
    : parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  value,
  onChange,
  type = "date",
  placeholder,
  required,
  disabled,
  min,
  max,
  className,
  name,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseDate(value);
  const minDate = min ? parseDate(min) : undefined;
  const maxDate = max ? parseDate(max) : undefined;

  // For datetime-local, fall back to native input (calendar popup doesn't handle time)
  if (type === "datetime-local") {
    return (
      <div className={cn("relative", className)}>
        <input
          type="datetime-local"
          name={name}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={INPUT_CLASSES}
        />
        <Calendar className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    );
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleSelect(day: Date | undefined) {
    if (day) {
      onChange(format(day, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
    setOpen(false);
  }

  const displayValue = selected ? format(selected, "MMM d, yyyy") : "";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value || ""} />
      {required && !value && <input tabIndex={-1} className="sr-only" required />}

      {/* Visible trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          INPUT_CLASSES,
          "cursor-pointer text-start",
          !displayValue && "text-slate-400 dark:text-gray-500"
        )}
      >
        {displayValue || placeholder || "Select date"}
        <Calendar className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            showOutsideDays
            classNames={{
              months: "flex flex-col",
              month_caption: "flex justify-center items-center h-8",
              caption_label: "text-sm font-medium text-slate-900 dark:text-gray-100",
              nav: "flex items-center gap-1",
              button_previous: "absolute start-1 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800",
              button_next: "absolute end-1 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800",
              month_grid: "mt-2",
              weekdays: "flex",
              weekday: "w-9 text-center text-xs font-medium text-slate-500 dark:text-gray-400",
              week: "flex mt-1",
              day: "h-9 w-9 text-center text-sm",
              day_button: "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm hover:bg-slate-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
              selected: "!bg-brand-600 !text-white hover:!bg-brand-700",
              today: "font-bold text-brand-600 dark:text-brand-400",
              outside: "text-slate-300 dark:text-gray-600",
              disabled: "text-slate-200 dark:text-gray-700 cursor-not-allowed hover:bg-transparent",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ),
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-1 w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── DateRangePicker ─────────────────────────────────────────────

interface DateRangePickerProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  type?: "date" | "datetime-local";
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  type = "date",
  required,
  disabled,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker
        value={fromValue}
        onChange={onFromChange}
        type={type}
        placeholder="From"
        required={required}
        disabled={disabled}
        max={toValue || undefined}
        className="flex-1"
      />
      <span className="text-sm text-slate-400 dark:text-gray-500">to</span>
      <DatePicker
        value={toValue}
        onChange={onToChange}
        type={type}
        placeholder="To"
        required={required}
        disabled={disabled}
        min={fromValue || undefined}
        className="flex-1"
      />
    </div>
  );
}
