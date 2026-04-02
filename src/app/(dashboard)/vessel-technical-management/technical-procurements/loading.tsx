export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-20 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="space-y-0 divide-y divide-gray-200">
          <div className="h-12 w-full animate-pulse bg-gray-50" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
