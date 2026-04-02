export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <div className="mb-1 h-3 w-12 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        </div>
        <div>
          <div className="mb-1 h-3 w-12 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-36 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-16 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-24 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
