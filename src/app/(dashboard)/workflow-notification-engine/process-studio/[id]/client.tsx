"use client";

import { useCallback } from "react";
import { type Node, type Edge } from "@xyflow/react";
import { WorkflowCanvas } from "@/components/process-studio/workflow-canvas";

interface Props {
  workflowId: string;
  workflowName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function ProcessStudioClient({
  workflowId,
  workflowName,
  initialNodes,
  initialEdges,
}: Props) {
  const handleSave = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      const res = await fetch(
        `/api/v1/workflow-notification-engine/workflows/${workflowId}/visual-layout`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Failed to save workflow layout");
      }
    },
    [workflowId]
  );

  return (
    <WorkflowCanvas
      workflowId={workflowId}
      workflowName={workflowName}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onSave={handleSave}
    />
  );
}
