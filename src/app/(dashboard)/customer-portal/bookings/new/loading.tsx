export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
