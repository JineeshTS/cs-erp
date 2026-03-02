export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-10 w-full max-w-sm animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="flex gap-6">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3">
            <div className="flex gap-6">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
