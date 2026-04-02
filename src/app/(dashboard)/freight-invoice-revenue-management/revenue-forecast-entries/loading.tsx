export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-36 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-20 animate-pulse rounded bg-gray-100" />
        </div>
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
