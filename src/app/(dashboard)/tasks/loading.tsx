export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-7 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-900">
        {/* Table header */}
        <div className="flex gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-gray-100 px-4 py-3 last:border-0 dark:border-gray-800"
          >
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
