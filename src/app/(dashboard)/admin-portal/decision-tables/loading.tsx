export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-96 animate-pulse rounded bg-gray-100" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg border bg-gray-50" />
        ))}
      </div>
    </div>
  );
}
