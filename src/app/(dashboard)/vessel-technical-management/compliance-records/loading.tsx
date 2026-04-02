export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="h-10 flex-1 min-w-[200px] animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-24 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
