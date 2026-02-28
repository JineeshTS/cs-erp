export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-50" />
      </div>
      <div className="rounded-lg border bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-0">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
