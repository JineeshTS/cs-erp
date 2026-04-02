export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  );
}
