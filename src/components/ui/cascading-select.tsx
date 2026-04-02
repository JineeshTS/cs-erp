"use client";

import { useEffect, useState, useCallback } from "react";
import { SearchableSelect } from "./searchable-select";
import { cn } from "@/lib/utils";

interface CascadingSelectProps {
  /** Parent entity type (e.g., "ports") */
  parentEntity: string;
  /** Child entity type (e.g., "terminals") */
  childEntity: string;
  /** Parent label */
  parentLabel?: string;
  /** Child label */
  childLabel?: string;
  /** Selected parent value */
  parentValue: string;
  /** Selected child value */
  childValue: string;
  /** Callback when parent changes */
  onParentChange: (value: string) => void;
  /** Callback when child changes */
  onChildChange: (value: string) => void;
  /** Parent field name for form submission */
  parentName?: string;
  /** Child field name for form submission */
  childName?: string;
  /** Whether both fields are required */
  required?: boolean;
  /** Whether both fields are disabled */
  disabled?: boolean;
  className?: string;
}

/**
 * ERP-055: Cascading dropdown — selecting a parent filters the child options.
 * Uses the lookups API with ?parentId= parameter.
 */
export function CascadingSelect({
  parentEntity,
  childEntity,
  parentLabel = "Parent",
  childLabel = "Child",
  parentValue,
  childValue,
  onParentChange,
  onChildChange,
  parentName,
  childName,
  required,
  disabled,
  className,
}: CascadingSelectProps) {
  const [childOptions, setChildOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingChild, setLoadingChild] = useState(false);

  const fetchChildOptions = useCallback(async (parentId: string) => {
    if (!parentId) {
      setChildOptions([]);
      return;
    }
    setLoadingChild(true);
    try {
      const res = await fetch(`/api/v1/lookups/${childEntity}?parentId=${parentId}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setChildOptions(json.data || []);
      }
    } catch {
      setChildOptions([]);
    } finally {
      setLoadingChild(false);
    }
  }, [childEntity]);

  useEffect(() => {
    fetchChildOptions(parentValue);
  }, [parentValue, fetchChildOptions]);

  function handleParentChange(value: string) {
    onParentChange(value);
    onChildChange(""); // Reset child when parent changes
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
          {parentLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <SearchableSelect
          entity={parentEntity}
          value={parentValue}
          onChange={handleParentChange}
          placeholder={`Select ${parentLabel.toLowerCase()}...`}
          name={parentName}
          required={required}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
          {childLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <SearchableSelect
          options={childOptions}
          value={childValue}
          onChange={onChildChange}
          placeholder={
            !parentValue
              ? `Select ${parentLabel.toLowerCase()} first`
              : loadingChild
                ? "Loading..."
                : `Select ${childLabel.toLowerCase()}...`
          }
          name={childName}
          required={required}
          disabled={disabled || !parentValue || loadingChild}
        />
      </div>
    </div>
  );
}
