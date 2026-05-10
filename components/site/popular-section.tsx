import Link from "next/link";
import { Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/site/event-card";
import { mockEvents } from "@/lib/mock-events";

export function PopularSection() {
  const popular = [...mockEvents]
    .sort((a, b) => b.buyersLast24h - a.buyersLast24h)
    .slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:py-16">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <Badge variant="secondary" className="rounded-full">
              últimas 24h
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Mais procurados agora
          </h2>
          <p className="text-sm text-muted-foreground">
            Os eventos com mais compradores nas últimas 24 horas.
          </p>
        </div>
        <Link
          href="/eventos?sort=popular"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {popular.map((event) => (
          <div key={event.id} className="relative">
            <EventCard event={event} />
            <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-background/95 px-2 py-1 text-[11px] font-medium shadow-sm backdrop-blur">
              {event.buyersLast24h} compras
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
