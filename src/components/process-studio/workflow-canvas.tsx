"use client";

import { useCallback, useState, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type OnConnect,
  MarkerType,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NODE_TYPES, NODE_PALETTE } from "./bpmn-nodes";
import { PropertiesPanel } from "./properties-panel";
import { cn } from "@/lib/utils";
import { Save, Undo2, Trash2 } from "lucide-react";

interface WorkflowCanvasProps {
  workflowId: string;
  workflowName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => Promise<void>;
}

let nodeIdCounter = 0;
function getNextId() {
  return `node_${Date.now()}_${++nodeIdCounter}`;
}

function WorkflowCanvasInner({
  workflowId,
  workflowName,
  initialNodes,
  initialEdges,
  onSave,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            style: { strokeWidth: 2 },
          },
          eds
        )
      );
      setDirty(true);
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-type");
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 20,
      };

      const paletteItem = NODE_PALETTE.find((p) => p.type === type);
      const newNode: Node = {
        id: getNextId(),
        type,
        position,
        data: {
          label: paletteItem?.label || type,
          assigneeType: "role",
          assignee: "",
          requiredApprovals: 1,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setDirty(true);
    },
    [setNodes]
  );

  const onUpdateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data } : n))
      );
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
      setDirty(true);
    },
    [setNodes]
  );

  const handleDeleteSelected = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
    setDirty(true);
  }, [selectedNode, setNodes, setEdges]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(nodes, edges);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, onSave]);

  // Track changes
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (changes.some((c) => c.type === "position" || c.type === "remove")) {
        setDirty(true);
      }
    },
    [onNodesChange]
  );

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Node Palette */}
      <div className="w-52 shrink-0 border-e border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
          Node Palette
        </h3>
        <div className="space-y-1.5">
          {NODE_PALETTE.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className="flex cursor-grab items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:shadow-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-slate-50 dark:bg-gray-950"
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls className="!border-slate-200 !bg-white dark:!border-gray-700 dark:!bg-gray-900 [&>button]:!border-slate-200 dark:[&>button]:!border-gray-700 dark:[&>button]:!bg-gray-900" />
          <MiniMap
            nodeStrokeColor="#94a3b8"
            nodeColor="#e2e8f0"
            maskColor="rgba(0,0,0,0.1)"
            className="!border-slate-200 !bg-white dark:!border-gray-700 dark:!bg-gray-900"
          />

          {/* Top toolbar */}
          <Panel position="top-right" className="flex items-center gap-2">
            {selectedNode && selectedNode.type !== "start" && selectedNode.type !== "end" && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold shadow-sm",
                dirty
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-600"
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : dirty ? "Save" : "Saved"}
            </button>
          </Panel>

          {/* Workflow name */}
          <Panel position="top-left">
            <div className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:bg-gray-900/90 dark:text-gray-300">
              {workflowName}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        node={selectedNode}
        onUpdate={onUpdateNodeData}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
