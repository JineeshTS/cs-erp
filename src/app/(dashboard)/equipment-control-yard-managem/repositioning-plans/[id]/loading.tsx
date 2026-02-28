export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="flex-1">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              <div className="mt-1 h-5 w-36 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
