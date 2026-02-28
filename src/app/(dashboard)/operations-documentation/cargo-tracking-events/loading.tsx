export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-10 w-44 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-16 animate-pulse rounded-lg border bg-gray-50" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-50" />
        ))}
      </div>
    </div>
  );
}
