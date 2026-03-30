"use client";

import { useState } from "react";
import { Search, Ship, MapPin, Clock, Anchor } from "lucide-react";

/**
 * ERP-094: Public BL Tracking Page — NO auth required.
 * Enter BL number or tracking number to view shipment status.
 */

interface TrackingEvent {
  eventCode: string;
  eventDescription: string;
  location: string | null;
  eventTime: string;
}

interface TrackingResult {
  blNumber: string | null;
  trackingNumber: string | null;
  currentStatus: string;
  vesselName: string | null;
  voyageNumber: string | null;
  originPort: string;
  destinationPort: string;
  eta: string | null;
  events: TrackingEvent[];
}

export default function PublicTrackingPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({ q: trimmed });
      const res = await fetch(`/api/v1/public/tracking?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Shipment not found");
        return;
      }

      setResult(data.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    booked: "bg-blue-100 text-blue-800",
    in_transit: "bg-green-100 text-green-800",
    arrived: "bg-purple-100 text-purple-800",
    delivered: "bg-gray-100 text-gray-800",
    delayed: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Track Your Shipment</h1>
        <p className="mt-2 text-gray-500">
          Enter your Bill of Lading number or tracking number
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mx-auto flex max-w-xl items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute start-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="BL number or tracking number..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pe-4 ps-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && (
        <div className="mx-auto max-w-xl rounded-lg bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {result.blNumber ? `BL: ${result.blNumber}` : ""}
                  {result.blNumber && result.trackingNumber ? " | " : ""}
                  {result.trackingNumber ? `Tracking: ${result.trackingNumber}` : ""}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    statusColors[result.currentStatus] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {result.currentStatus.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <Ship className="h-8 w-8 text-blue-600" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Anchor className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Vessel / Voyage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {result.vesselName ?? "N/A"}{" "}
                    {result.voyageNumber ? `/ ${result.voyageNumber}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">ETA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {result.eta
                      ? new Date(result.eta).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Origin</p>
                  <p className="text-sm font-medium text-gray-900">
                    {result.originPort}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm font-medium text-gray-900">
                    {result.destinationPort}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {result.events.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Tracking Timeline
              </h2>
              <div className="space-y-0">
                {result.events.map((event, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {idx < result.events.length - 1 && (
                      <div className="absolute start-[7px] top-4 h-full w-px bg-gray-200" />
                    )}
                    {/* Dot */}
                    <div
                      className={`relative z-10 mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                        idx === 0
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {event.eventDescription}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {event.location && `${event.location} — `}
                        {new Date(event.eventTime).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
