export default function SkeletonCard() {
  return (
    <div className="card flex flex-col overflow-hidden h-full animate-pulse">
      {/* Image */}
      <div className="bg-slate-200 aspect-square w-full" />

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Product name — 2 lines */}
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded-full w-full" />
          <div className="h-3 bg-slate-200 rounded-full w-3/4" />
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded-full w-14" />
          <div className="h-3 bg-slate-100 rounded-full w-10" />
        </div>

        {/* Add button */}
        <div className="mt-auto h-9 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
}
