export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
