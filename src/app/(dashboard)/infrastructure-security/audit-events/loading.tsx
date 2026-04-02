export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-50" />
      </div>
      <div className="rounded-lg border bg-white">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
