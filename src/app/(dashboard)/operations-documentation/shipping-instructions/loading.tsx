export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-50" />
      </div>
      <div className="rounded-lg border bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-0">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
