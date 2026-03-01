export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-lg border bg-white divide-y">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 px-6 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="col-span-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
