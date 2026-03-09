"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Ship,
  Container,
  Anchor,
  Layers,
  Radio,
  RefreshCw,
} from "lucide-react";
import type { MapData } from "@/components/tracking/tracking-map";

const TrackingMap = dynamic(
  () =>
    import("@/components/tracking/tracking-map").then((m) => m.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-400">
        Loading map...
      </div>
    ),
  }
);

interface TrackingDashboardProps {
  initialData: MapData;
}

type LayerFilter = "all" | "vessels" | "containers" | "ports";

export function TrackingDashboard({ initialData }: TrackingDashboardProps) {
  const [data, setData] = useState(initialData);
  const [activeLayer, setActiveLayer] = useState<LayerFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "vessel" | "container" | "port" | null
  >(null);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/v1/tracking/map-data");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {
      // silently fail — keep existing data
    } finally {
      setRefreshing(false);
    }
  }

  function handleMarkerClick(
    type: "vessel" | "container" | "port",
    id: string
  ) {
    setSelectedId(id);
    setSelectedType(type);
  }

  const layerButtons: {
    key: LayerFilter;
    label: string;
    icon: typeof Ship;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All",
      icon: Layers,
      count:
        data.vessels.length + data.containers.length + data.ports.length,
    },
    { key: "vessels", label: "Vessels", icon: Ship, count: data.vessels.length },
    {
      key: "containers",
      label: "Containers",
      icon: Container,
      count: data.containers.length,
    },
    { key: "ports", label: "Ports", icon: Anchor, count: data.ports.length },
  ];

  const selectedItem = selectedId
    ? selectedType === "vessel"
      ? data.vessels.find((v) => v.id === selectedId)
      : selectedType === "container"
        ? data.containers.find((c) => c.id === selectedId)
        : data.ports.find((p) => p.id === selectedId)
    : null;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Live Tracking
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Real-time vessel, container, and port monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {layerButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveLayer(btn.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeLayer === btn.key
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <btn.icon className="h-3.5 w-3.5" />
                {btn.label}
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    activeLayer === btn.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Map + Side Panel */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <TrackingMap
            data={data}
            activeLayer={activeLayer}
            selectedId={selectedId}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="w-80 shrink-0 overflow-y-auto rounded-xl border border-slate-200/60 bg-white shadow-sm">
          {selectedItem && selectedType ? (
            <SelectedDetail
              type={selectedType}
              item={selectedItem}
              onClose={() => {
                setSelectedId(null);
                setSelectedType(null);
              }}
            />
          ) : (
            <AssetList
              data={data}
              activeLayer={activeLayer}
              onSelect={handleMarkerClick}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Radio className="h-3 w-3 text-emerald-500" />
          Live tracking active
        </span>
        <span>
          {data.vessels.length} vessels &middot; {data.containers.length}{" "}
          containers &middot; {data.ports.length} ports
        </span>
      </div>
    </div>
  );
}

/* ============ Detail Panel ============ */

function SelectedDetail({
  type,
  item,
  onClose,
}: {
  type: "vessel" | "container" | "port";
  item: MapData["vessels"][0] | MapData["containers"][0] | MapData["ports"][0];
  onClose: () => void;
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {type === "vessel"
            ? "Vessel"
            : type === "container"
              ? "Container"
              : "Port"}{" "}
          Details
        </h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {type === "vessel" && (
        <VesselDetail item={item as MapData["vessels"][0]} />
      )}
      {type === "container" && (
        <ContainerDetail item={item as MapData["containers"][0]} />
      )}
      {type === "port" && <PortDetail item={item as MapData["ports"][0]} />}
    </div>
  );
}

function VesselDetail({ item }: { item: MapData["vessels"][0] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Ship className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">IMO: {item.imo}</p>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <DetailRow label="MMSI" value={item.mmsi} />
        <DetailRow label="Speed" value={`${item.speed} kn`} />
        <DetailRow label="Course" value={`${item.course}\u00B0`} />
        <DetailRow label="Nav Status" value={item.navStatus || "—"} />
        <DetailRow label="Destination" value={item.destination || "—"} />
        {item.eta && (
          <DetailRow
            label="ETA"
            value={new Date(item.eta).toLocaleDateString()}
          />
        )}
        <DetailRow
          label="Position"
          value={`${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
          mono
        />
        <DetailRow
          label="Updated"
          value={new Date(item.updatedAt).toLocaleString()}
        />
      </dl>
    </div>
  );
}

function ContainerDetail({ item }: { item: MapData["containers"][0] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
          <Container className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="font-mono font-semibold text-slate-900">
            {item.containerNumber}
          </p>
          <p className="text-xs text-slate-500">{item.containerType}</p>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <DetailRow label="Tracking Type" value={item.trackingType} />
        <DetailRow label="Location" value={item.locationName || "At sea"} />
        <DetailRow label="Speed" value={`${item.speed} km/h`} />
        <DetailRow label="Heading" value={`${item.heading}\u00B0`} />
        <DetailRow label="Device ID" value={item.deviceId || "—"} />
        {item.batteryLevel != null && (
          <DetailRow label="Battery" value={`${item.batteryLevel}%`} />
        )}
        <DetailRow
          label="Position"
          value={`${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
          mono
        />
        <DetailRow
          label="Updated"
          value={new Date(item.updatedAt).toLocaleString()}
        />
      </dl>
    </div>
  );
}

function PortDetail({ item }: { item: MapData["ports"][0] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Anchor className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="font-mono text-xs text-slate-500">{item.unLocode}</p>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <DetailRow label="Country" value={item.country} />
        <DetailRow label="Type" value={item.portType} />
        <DetailRow
          label="Position"
          value={`${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
          mono
        />
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`text-right font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

/* ============ Asset List Panel ============ */

function AssetList({
  data,
  activeLayer,
  onSelect,
}: {
  data: MapData;
  activeLayer: LayerFilter;
  onSelect: (type: "vessel" | "container" | "port", id: string) => void;
}) {
  const showVessels = activeLayer === "all" || activeLayer === "vessels";
  const showContainers = activeLayer === "all" || activeLayer === "containers";
  const showPorts = activeLayer === "all" || activeLayer === "ports";

  const hasAny =
    data.vessels.length > 0 ||
    data.containers.length > 0 ||
    data.ports.length > 0;

  return (
    <div className="divide-y divide-slate-100">
      {showVessels && data.vessels.length > 0 && (
        <div className="p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vessels ({data.vessels.length})
          </h3>
          <div className="space-y-1">
            {data.vessels.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelect("vessel", v.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50"
              >
                <Ship className="h-4 w-4 shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {v.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.speed} kn &middot; {v.navStatus || "—"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showContainers && data.containers.length > 0 && (
        <div className="p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Containers ({data.containers.length})
          </h3>
          <div className="space-y-1">
            {data.containers.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect("container", c.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50"
              >
                <Container className="h-4 w-4 shrink-0 text-green-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono font-medium text-slate-900">
                    {c.containerNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.locationName || "At sea"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showPorts && data.ports.length > 0 && (
        <div className="p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ports ({data.ports.length})
          </h3>
          <div className="space-y-1">
            {data.ports.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect("port", p.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50"
              >
                <Anchor className="h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.unLocode} &middot; {p.country}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasAny && (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Radio className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">
            No tracking data
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Configure AIS polling or GPS webhooks to see live asset positions.
          </p>
        </div>
      )}
    </div>
  );
}
