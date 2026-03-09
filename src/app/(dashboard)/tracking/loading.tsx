export default function TrackingLoading() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 animate-pulse rounded-xl border border-slate-200/60 bg-slate-100" />
        <div className="w-80 shrink-0 animate-pulse rounded-xl border border-slate-200/60 bg-slate-50" />
      </div>
    </div>
  );
}
