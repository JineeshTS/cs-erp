"use client";

import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

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

/**
 * DatePicker — styled wrapper around native date/datetime-local input.
 * Uses native browser picker for best mobile support.
 * Future: replace with custom calendar component (react-day-picker).
 */
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
  return (
    <div className={cn("relative", className)}>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors",
          "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        )}
      />
      <Calendar className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

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

/**
 * DateRangePicker — two DatePicker inputs for from/to date range.
 * Auto-sets min on "to" field based on "from" value.
 */
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
