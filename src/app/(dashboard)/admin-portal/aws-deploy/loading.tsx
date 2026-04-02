export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-lg border bg-gray-50" />
    </div>
  );
}
