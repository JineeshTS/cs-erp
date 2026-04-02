export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-96 animate-pulse rounded bg-gray-100" />
      <div className="h-10 w-full animate-pulse rounded-lg border bg-gray-50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded bg-gray-50" />
        ))}
      </div>
    </div>
  );
}
