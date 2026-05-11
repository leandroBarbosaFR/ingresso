import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

import { brl, dateShort } from "@/lib/format";

export type EventCardEvent = {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  venue_city: string;
  venue_state: string;
  starts_at: string;
  price_from_cents: number;
};

export function EventCard({ event }: { event: EventCardEvent }) {
  return (
    <Link
      href={`/e/${event.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sem capa
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{dateShort(event.starts_at)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {event.venue_city} · {event.venue_state}
          </span>
        </div>
        <p className="pt-1 text-sm font-medium">
          {event.price_from_cents > 0
            ? `A partir de ${brl(event.price_from_cents)}`
            : "Em breve"}
        </p>
      </div>
    </Link>
  );
}
