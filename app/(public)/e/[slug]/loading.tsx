import { Skeleton } from "@/components/ui/skeleton";

export default function PublicEventLoading() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </article>
  );
}
