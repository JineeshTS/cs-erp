export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 17 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
