"use client";

import { useEffect, useState, useMemo, memo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Position,
  Handle,
  type NodeProps,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Loader2,
  Bot,
  Users,
  Cog,
  ListChecks,
  GitBranch,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ── Types ──

interface TaskDef {
  taskCode: string;
  name: string;
  taskOrder: number;
  stepCount: number;
}

interface ProcessDef {
  processCode: string;
  name: string;
  stepOrder: number;
  phase: string | null;
  module: string | null;
  tasks: TaskDef[];
}

interface FlowHierarchy {
  flowCode: string;
  name: string;
  category: string | null;
  entityType: string | null;
  triggerEvent: string | null;
  processes: ProcessDef[];
}

// ── Custom Node: Flow (top-level) ──

function FlowNodeInner({ data }: NodeProps) {
  return (
    <div className="rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-4 shadow-lg dark:from-purple-950 dark:to-purple-900 min-w-[240px]">
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
          <GitBranch className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">{String(data.flowCode ?? "")}</div>
          <div className="text-sm font-bold text-purple-900 dark:text-purple-100">{String(data.label ?? "")}</div>
          {data.subtitle ? <div className="text-[10px] text-purple-600 dark:text-purple-400">{String(data.subtitle)}</div> : null}
        </div>
      </div>
    </div>
  );
}
const FlowNode = memo(FlowNodeInner);

// ── Custom Node: Process ──

function ProcessNodeInner({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-3 shadow-md dark:from-blue-950 dark:to-blue-900 min-w-[220px]">
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white shrink-0">
          <Cog className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">{String(data.processCode ?? "")}</div>
          <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 truncate">{String(data.label ?? "")}</div>
          {data.phase ? <div className="text-[10px] text-blue-600 dark:text-blue-400">{String(data.phase)}</div> : null}
        </div>
        <div className="ms-auto flex items-center gap-1 rounded-full bg-blue-200 dark:bg-blue-800 px-2 py-0.5">
          <ListChecks className="h-3 w-3 text-blue-600 dark:text-blue-300" />
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-200">{String(data.taskCount ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
const ProcessNode = memo(ProcessNodeInner);

// ── Custom Node: Task ──

function TaskNodeInner({ data }: NodeProps) {
  return (
    <div className="rounded-md border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white px-4 py-2 shadow-sm dark:from-emerald-950 dark:to-gray-900 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white shrink-0">
          <span className="text-[9px] font-bold">T{String(data.order ?? "")}</span>
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">{String(data.taskCode ?? "")}</div>
          <div className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate">{String(data.label ?? "")}</div>
        </div>
        {Number(data.stepCount ?? 0) > 0 ? (
          <div className="ms-auto rounded bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300">{String(data.stepCount)} steps</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
const TaskNode = memo(TaskNodeInner);

// ── Node types registry ──

const nodeTypes = {
  flowNode: FlowNode,
  processNode: ProcessNode,
  taskNode: TaskNode,
};

// ── Layout: build nodes & edges from hierarchy data ──

function buildFlowGraph(data: FlowHierarchy): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const PROCESS_GAP_X = 280;
  const TASK_GAP_X = 240;
  const FLOW_Y = 0;
  const PROCESS_Y = 150;
  const TASK_Y = 310;

  const processCount = data.processes.length;

  // Flow node — centered
  const flowWidth = Math.max(processCount * PROCESS_GAP_X, 300);
  nodes.push({
    id: "flow",
    type: "flowNode",
    position: { x: flowWidth / 2 - 120, y: FLOW_Y },
    data: {
      label: data.name,
      flowCode: data.flowCode,
      subtitle: `${data.category ?? ""} · ${processCount} processes`,
    },
  });

  // Process nodes
  const processStartX = (flowWidth - (processCount - 1) * PROCESS_GAP_X) / 2 - 110;

  data.processes.forEach((proc, pi) => {
    const procId = `proc-${proc.processCode}`;
    const px = processStartX + pi * PROCESS_GAP_X;

    nodes.push({
      id: procId,
      type: "processNode",
      position: { x: px, y: PROCESS_Y },
      data: {
        label: proc.name,
        processCode: proc.processCode,
        phase: proc.phase,
        taskCount: proc.tasks.length,
      },
    });

    edges.push({
      id: `flow-${procId}`,
      source: "flow",
      target: procId,
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#8b5cf6" },
      style: { strokeWidth: 2, stroke: "#8b5cf6" },
      animated: true,
    });

    // Task nodes for this process
    const taskCount = proc.tasks.length;
    const taskBlockWidth = (taskCount - 1) * TASK_GAP_X;
    const taskStartX = px + 110 - taskBlockWidth / 2 - 100;

    proc.tasks.forEach((task, ti) => {
      const taskId = `task-${task.taskCode}`;
      const tx = taskStartX + ti * TASK_GAP_X;

      nodes.push({
        id: taskId,
        type: "taskNode",
        position: { x: tx, y: TASK_Y + (ti % 2 === 1 ? 50 : 0) },
        data: {
          label: task.name,
          taskCode: task.taskCode,
          order: task.taskOrder,
          stepCount: task.stepCount,
        },
      });

      edges.push({
        id: `${procId}-${taskId}`,
        source: procId,
        target: taskId,
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "#3b82f6" },
        style: { strokeWidth: 1.5, stroke: "#3b82f6" },
      });
    });

    // Sequential edge between processes
    if (pi > 0) {
      const prevProcId = `proc-${data.processes[pi - 1].processCode}`;
      edges.push({
        id: `seq-${prevProcId}-${procId}`,
        source: prevProcId,
        target: procId,
        sourceHandle: null,
        targetHandle: null,
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "#94a3b8" },
        style: { strokeWidth: 2, stroke: "#94a3b8", strokeDasharray: "6 3" },
      });
    }
  });

  return { nodes, edges };
}

// ── Main Component ──

export function E2EFlowDiagram({ flowCode }: { flowCode: string }) {
  const [data, setData] = useState<FlowHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/processes/flow-hierarchy/${flowCode}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load flow data: ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [flowCode]);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    return buildFlowGraph(data);
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ms-3 text-sm text-gray-500">Loading flow diagram...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-sm text-red-500">{error ?? "No data found"}</p>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full rounded-lg border bg-slate-50 dark:bg-gray-950">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          className="bg-slate-50 dark:bg-gray-950"
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls
            showInteractive={false}
            className="!border-slate-200 !bg-white dark:!border-gray-700 dark:!bg-gray-900 [&>button]:!border-slate-200 dark:[&>button]:!border-gray-700 dark:[&>button]:!bg-gray-900"
          />
          <MiniMap
            nodeStrokeColor="#94a3b8"
            nodeColor="#e2e8f0"
            maskColor="rgba(0,0,0,0.08)"
            className="!border-slate-200 !bg-white dark:!border-gray-700 dark:!bg-gray-900"
          />
        </ReactFlow>
      </ReactFlowProvider>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-white dark:bg-gray-900 rounded-b-lg">
        <span className="text-xs font-medium text-gray-500">Legend:</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="h-3 w-3 rounded bg-purple-500" /> E2E Flow
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="h-3 w-3 rounded bg-blue-500" /> Process
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="h-3 w-3 rounded bg-emerald-500" /> Task
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="h-0.5 w-5 bg-purple-500" /> Flow → Process
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="h-0.5 w-5 border-t-2 border-dashed border-gray-400" /> Sequence
        </span>
      </div>
    </div>
  );
}
