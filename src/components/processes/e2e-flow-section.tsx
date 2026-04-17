"use client";

import { useState } from "react";
import { E2EFlowDiagram } from "./e2e-flow-diagram";
import { Eye, X } from "lucide-react";

interface E2EFlowDiagramToggleProps {
  flowCode: string;
  flowName: string;
}

export function E2EFlowDiagramToggle({ flowCode, flowName }: E2EFlowDiagramToggleProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        View Flow Diagram
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {flowCode}: {flowName} — Flow Hierarchy Diagram
        </h3>
        <button
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      </div>
      <E2EFlowDiagram flowCode={flowCode} />
    </div>
  );
}
