export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="flex-1">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-5 w-40 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
      <div className="overflow-hidden rounded-lg border bg-white">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
