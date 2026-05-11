import { EventCardGridSkeleton } from "@/components/site/event-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventosLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <div className="space-y-3">
        <Skeleton className="h-9 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 sm:w-[180px]" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <EventCardGridSkeleton count={8} />
    </div>
  );
}
