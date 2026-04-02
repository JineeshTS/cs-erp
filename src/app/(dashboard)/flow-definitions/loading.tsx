export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="mt-2 h-4 w-96 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="mt-2 h-8 w-12 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-t border-gray-200 dark:border-gray-700 px-4 py-3"
          >
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
