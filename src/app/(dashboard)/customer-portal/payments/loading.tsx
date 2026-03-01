export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-96 animate-pulse rounded bg-gray-100" />
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-20 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
