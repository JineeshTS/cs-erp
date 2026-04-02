export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="flex gap-3">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-24 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-8 border-b px-4 py-3 last:border-0"
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <div
                key={j}
                className="h-4 w-24 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
