export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
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
