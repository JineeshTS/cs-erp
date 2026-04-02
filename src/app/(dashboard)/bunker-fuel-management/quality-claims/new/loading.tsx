export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
