export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded-lg border bg-white">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center gap-4 border-b px-4 py-4 last:border-0"
              >
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
