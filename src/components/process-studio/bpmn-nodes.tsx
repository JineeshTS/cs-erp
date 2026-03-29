"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  Play,
  Square,
  User,
  ShieldCheck,
  Cog,
  Timer,
  GitBranch,
} from "lucide-react";

// ── Shared handle styles ────────────────────────────────────────

const handleClass =
  "!w-3 !h-3 !bg-brand-500 !border-2 !border-white dark:!border-gray-900";

// ── Start Node ──────────────────────────────────────────────────

function StartNodeInner({ data }: NodeProps) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50 shadow-sm dark:bg-emerald-900/30">
      <Play className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      <Handle type="source" position={Position.Bottom} className={handleClass} />
    </div>
  );
}
export const StartNode = memo(StartNodeInner);

// ── End Node ────────────────────────────────────────────────────

function EndNodeInner({ data }: NodeProps) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 bg-red-50 shadow-sm dark:bg-red-900/30">
      <Square className="h-5 w-5 text-red-600 dark:text-red-400" />
      <Handle type="target" position={Position.Top} className={handleClass} />
    </div>
  );
}
export const EndNode = memo(EndNodeInner);

// ── Task Node (shared layout) ───────────────────────────────────

function TaskNodeLayout({
  data,
  icon: Icon,
  borderColor,
  iconColor,
  selected,
}: NodeProps & {
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  iconColor: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border-2 bg-white px-3 py-2 shadow-sm dark:bg-gray-900",
        borderColor,
        selected && "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-950"
      )}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-slate-800 dark:text-gray-200">
            {String((data as Record<string, unknown>).label || "Untitled")}
          </div>
          {(data as Record<string, unknown>).assignee ? (
            <div className="truncate text-[10px] text-slate-400 dark:text-gray-500">
              {String((data as Record<string, unknown>).assignee)}
            </div>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={handleClass} />
    </div>
  );
}

// ── User Task ───────────────────────────────────────────────────

function UserTaskInner(props: NodeProps) {
  return (
    <TaskNodeLayout
      {...props}
      icon={User}
      borderColor="border-blue-400"
      iconColor="text-blue-500"
    />
  );
}
export const UserTaskNode = memo(UserTaskInner);

// ── Approval Gate ───────────────────────────────────────────────

function ApprovalGateInner(props: NodeProps) {
  return (
    <TaskNodeLayout
      {...props}
      icon={ShieldCheck}
      borderColor="border-amber-400"
      iconColor="text-amber-500"
    />
  );
}
export const ApprovalGateNode = memo(ApprovalGateInner);

// ── Service Task ────────────────────────────────────────────────

function ServiceTaskInner(props: NodeProps) {
  return (
    <TaskNodeLayout
      {...props}
      icon={Cog}
      borderColor="border-purple-400"
      iconColor="text-purple-500"
    />
  );
}
export const ServiceTaskNode = memo(ServiceTaskInner);

// ── Timer Event ─────────────────────────────────────────────────

function TimerEventInner(props: NodeProps) {
  return (
    <TaskNodeLayout
      {...props}
      icon={Timer}
      borderColor="border-orange-400"
      iconColor="text-orange-500"
    />
  );
}
export const TimerEventNode = memo(TimerEventInner);

// ── Gateway (Decision) ──────────────────────────────────────────

function GatewayInner(props: NodeProps) {
  return (
    <div className={cn("relative", props.selected && "ring-2 ring-brand-500 ring-offset-2 rounded-sm dark:ring-offset-gray-950")}>
      <Handle type="target" position={Position.Top} className={handleClass} />
      <div className="flex h-12 w-12 rotate-45 items-center justify-center border-2 border-teal-500 bg-teal-50 shadow-sm dark:bg-teal-900/30">
        <GitBranch className="h-5 w-5 -rotate-45 text-teal-600 dark:text-teal-400" />
      </div>
      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  );
}
export const GatewayNode = memo(GatewayInner);

// ── Node type registry ──────────────────────────────────────────

export const NODE_TYPES = {
  start: StartNode,
  end: EndNode,
  user_task: UserTaskNode,
  approval_gate: ApprovalGateNode,
  service_task: ServiceTaskNode,
  timer_event: TimerEventNode,
  gateway: GatewayNode,
};

export const NODE_PALETTE = [
  { type: "start", label: "Start", icon: Play, color: "text-emerald-500" },
  { type: "user_task", label: "User Task", icon: User, color: "text-blue-500" },
  { type: "approval_gate", label: "Approval Gate", icon: ShieldCheck, color: "text-amber-500" },
  { type: "service_task", label: "Service Task", icon: Cog, color: "text-purple-500" },
  { type: "timer_event", label: "Timer Event", icon: Timer, color: "text-orange-500" },
  { type: "gateway", label: "Decision Gateway", icon: GitBranch, color: "text-teal-500" },
  { type: "end", label: "End", icon: Square, color: "text-red-500" },
];
