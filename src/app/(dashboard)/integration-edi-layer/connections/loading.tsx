export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-4 w-96 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-16 animate-pulse rounded-lg border bg-gray-50" />
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
