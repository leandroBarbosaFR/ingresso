import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

import {
  formatEventDate,
  formatPriceFromCents,
  type MockEvent,
} from "@/lib/mock-events";

type Props = {
  event: MockEvent;
};

export function EventCard({ event }: Props) {
  return (
    <Link
      href={`/e/${event.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={event.cover}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatEventDate(event.startsAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {event.city} · {event.state}
          </span>
        </div>
        <p className="pt-1 text-sm font-medium">
          A partir de {formatPriceFromCents(event.priceFromCents)}
        </p>
      </div>
    </Link>
  );
}
