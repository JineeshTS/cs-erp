"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type L from "leaflet";

function escapeHtml(str: string | number | null | undefined): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface VesselMarker {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  lat: number;
  lng: number;
  course: number;
  speed: number;
  navStatus: string;
  destination: string;
  eta: string | null;
  updatedAt: string;
}

interface ContainerMarker {
  id: string;
  containerNumber: string;
  containerType: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  locationName: string;
  deviceId: string;
  batteryLevel: number | null;
  trackingType: string;
  updatedAt: string;
}

interface PortMarker {
  id: string;
  name: string;
  unLocode: string;
  country: string;
  lat: number;
  lng: number;
  portType: string;
}

export interface MapData {
  vessels: VesselMarker[];
  containers: ContainerMarker[];
  ports: PortMarker[];
}

interface TrackingMapProps {
  data: MapData;
  center?: [number, number];
  zoom?: number;
  activeLayer: "all" | "vessels" | "containers" | "ports";
  selectedId?: string | null;
  onMarkerClick?: (type: "vessel" | "container" | "port", id: string) => void;
}

export function TrackingMap({
  data,
  center = [25.3, 51.5],
  zoom = 5,
  activeLayer,
  selectedId,
  onMarkerClick,
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    vessels: L.LayerGroup;
    containers: L.LayerGroup;
    ports: L.LayerGroup;
  } | null>(null);
  const [leaflet, setLeaflet] = useState<typeof L | null>(null);

  // Load Leaflet dynamically (needs browser APIs)
  useEffect(() => {
    let cancelled = false;
    async function loadLeaflet() {
      const mod = await import("leaflet");
      if (!cancelled) setLeaflet(mod.default);
    }
    loadLeaflet();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    const map = leaflet.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 18,
      })
      .addTo(map);

    const vesselLayer = leaflet.layerGroup().addTo(map);
    const containerLayer = leaflet.layerGroup().addTo(map);
    const portLayer = leaflet.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    layersRef.current = {
      vessels: vesselLayer,
      containers: containerLayer,
      ports: portLayer,
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layersRef.current = null;
    };
  }, [leaflet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when data or activeLayer changes
  useEffect(() => {
    if (!leaflet || !layersRef.current || !mapInstanceRef.current) return;

    const { vessels, containers, ports } = layersRef.current;
    vessels.clearLayers();
    containers.clearLayers();
    ports.clearLayers();

    const showVessels = activeLayer === "all" || activeLayer === "vessels";
    const showContainers = activeLayer === "all" || activeLayer === "containers";
    const showPorts = activeLayer === "all" || activeLayer === "ports";

    // --- Vessel markers (blue ship) ---
    if (showVessels) {
      const vesselIcon = leaflet.divIcon({
        className: "vessel-marker",
        html: `<div style="width:28px;height:28px;background:#2563eb;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v-4"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      for (const v of data.vessels) {
        const isSelected = selectedId === v.id;
        const icon = isSelected
          ? leaflet.divIcon({
              className: "vessel-marker-selected",
              html: `<div style="width:36px;height:36px;background:#1d4ed8;border:3px solid #fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v-4"/></svg>
              </div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })
          : vesselIcon;

        const marker = leaflet.marker([v.lat, v.lng], { icon }).addTo(vessels);

        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#1e293b">${escapeHtml(v.name)}</div>
            <div style="color:#64748b;font-size:12px;margin-bottom:8px">IMO: ${escapeHtml(v.imo)} | MMSI: ${escapeHtml(v.mmsi)}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:12px">
              <span style="color:#94a3b8">Speed</span><span style="color:#1e293b;font-weight:500">${escapeHtml(v.speed)} kn</span>
              <span style="color:#94a3b8">Course</span><span style="color:#1e293b;font-weight:500">${escapeHtml(v.course)}&deg;</span>
              <span style="color:#94a3b8">Status</span><span style="color:#1e293b;font-weight:500">${escapeHtml(v.navStatus) || "—"}</span>
              <span style="color:#94a3b8">Destination</span><span style="color:#1e293b;font-weight:500">${escapeHtml(v.destination) || "—"}</span>
              ${v.eta ? `<span style="color:#94a3b8">ETA</span><span style="color:#1e293b;font-weight:500">${escapeHtml(new Date(v.eta).toLocaleDateString())}</span>` : ""}
            </div>
            <div style="margin-top:8px;font-size:11px;color:#94a3b8">Updated: ${escapeHtml(new Date(v.updatedAt).toLocaleString())}</div>
          </div>`
        );

        marker.on("click", () => onMarkerClick?.("vessel", v.id));
      }
    }

    // --- Container markers (green box) ---
    if (showContainers) {
      const containerIcon = leaflet.divIcon({
        className: "container-marker",
        html: `<div style="width:24px;height:24px;background:#16a34a;border:2px solid #fff;border-radius:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="22" height="18" rx="2"/><path d="M12 3v18"/><path d="M1 9h22"/><path d="M1 15h22"/></svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      for (const c of data.containers) {
        const isSelected = selectedId === c.id;
        const icon = isSelected
          ? leaflet.divIcon({
              className: "container-marker-selected",
              html: `<div style="width:32px;height:32px;background:#15803d;border:3px solid #fbbf24;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="22" height="18" rx="2"/><path d="M12 3v18"/><path d="M1 9h22"/><path d="M1 15h22"/></svg>
              </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })
          : containerIcon;

        const marker = leaflet
          .marker([c.lat, c.lng], { icon })
          .addTo(containers);

        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e293b;font-family:monospace">${escapeHtml(c.containerNumber)}</div>
            <div style="color:#64748b;font-size:12px;margin-bottom:8px">${escapeHtml(c.containerType)} | ${escapeHtml(c.trackingType)}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:12px">
              <span style="color:#94a3b8">Location</span><span style="color:#1e293b;font-weight:500">${escapeHtml(c.locationName) || "At sea"}</span>
              <span style="color:#94a3b8">Speed</span><span style="color:#1e293b;font-weight:500">${escapeHtml(c.speed)} km/h</span>
              <span style="color:#94a3b8">Device</span><span style="color:#1e293b;font-weight:500">${escapeHtml(c.deviceId) || "—"}</span>
              ${c.batteryLevel != null ? `<span style="color:#94a3b8">Battery</span><span style="color:#1e293b;font-weight:500">${escapeHtml(c.batteryLevel)}%</span>` : ""}
            </div>
            <div style="margin-top:8px;font-size:11px;color:#94a3b8">Updated: ${escapeHtml(new Date(c.updatedAt).toLocaleString())}</div>
          </div>`
        );

        marker.on("click", () => onMarkerClick?.("container", c.id));
      }
    }

    // --- Port markers (slate anchor) ---
    if (showPorts) {
      const portIcon = leaflet.divIcon({
        className: "port-marker",
        html: `<div style="width:22px;height:22px;background:#475569;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.25)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      for (const p of data.ports) {
        const marker = leaflet
          .marker([p.lat, p.lng], { icon: portIcon })
          .addTo(ports);

        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px">
            <div style="font-weight:700;font-size:14px;color:#1e293b">${escapeHtml(p.name)}</div>
            <div style="color:#64748b;font-size:12px;margin-top:2px">
              <span style="font-family:monospace">${escapeHtml(p.unLocode)}</span> &middot; ${escapeHtml(p.country)} &middot; ${escapeHtml(p.portType)}
            </div>
          </div>`
        );

        marker.on("click", () => onMarkerClick?.("port", p.id));
      }
    }

    // Fly to selected marker
    if (selectedId && mapInstanceRef.current) {
      const all = [
        ...data.vessels.map((v) => ({ id: v.id, lat: v.lat, lng: v.lng })),
        ...data.containers.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng })),
        ...data.ports.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })),
      ];
      const found = all.find((m) => m.id === selectedId);
      if (found) {
        mapInstanceRef.current.flyTo([found.lat, found.lng], 10, {
          duration: 1,
        });
      }
    }
  }, [leaflet, data, activeLayer, selectedId, onMarkerClick]);

  // Handle resize
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [leaflet]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!leaflet && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-400">Loading map...</div>
        </div>
      )}
    </div>
  );
}
