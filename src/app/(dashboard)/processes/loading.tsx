export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-96 rounded bg-gray-100" />
      </div>
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="mt-2 h-8 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <div className="h-5 w-28 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-100" />
        <div className="h-5 w-24 rounded bg-gray-100" />
      </div>
      {/* Filter bar */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex gap-3">
          <div className="h-9 flex-1 rounded bg-gray-100" />
          <div className="h-9 w-40 rounded bg-gray-100" />
          <div className="h-9 w-32 rounded bg-gray-100" />
          <div className="h-9 w-32 rounded bg-gray-100" />
        </div>
      </div>
      {/* Process cards */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 rounded bg-gray-100" />
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="ms-auto h-5 w-20 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
