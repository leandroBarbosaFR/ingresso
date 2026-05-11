import { EventCardGridSkeleton } from "@/components/site/event-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <Skeleton className="aspect-[16/6] w-full rounded-2xl sm:aspect-[16/4]" />
      <EventCardGridSkeleton count={8} />
    </div>
  );
}
