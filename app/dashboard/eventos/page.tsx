import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Plus, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";
import { listEventsWithStats } from "@/lib/data/events";
import { brl, dateShort } from "@/lib/format";

const statusMeta: Record<
  string,
  { label: string; tone: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Rascunho", tone: "secondary" },
  published: { label: "Publicado", tone: "default" },
  cancelled: { label: "Cancelado", tone: "outline" },
  finished: { label: "Encerrado", tone: "outline" },
};

export default async function EventsListPage() {
  const { organizer } = await requireOrganizer();
  const events = await listEventsWithStats(organizer.id);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </p>
        </div>
        <Link href="/dashboard/eventos/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum evento ainda. Comece criando o primeiro.
            </p>
            <Link href="/dashboard/eventos/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Criar evento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => {
            const meta = statusMeta[evt.status] ?? statusMeta.draft;
            const pct =
              evt.total === 0 ? 0 : Math.round((evt.sold / evt.total) * 100);
            return (
              <Link
                key={evt.id}
                href={`/dashboard/eventos/${evt.id}`}
                className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/40"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  {evt.cover_url ? (
                    <Image
                      src={evt.cover_url}
                      alt={evt.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Sem capa
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant={meta.tone}>{meta.label}</Badge>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-base font-semibold leading-tight">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {dateShort(evt.starts_at)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {evt.venue_city} · {evt.venue_state}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Vendidos</span>
                      <span className="tabular-nums">
                        {evt.sold} / {evt.total}{" "}
                        <span className="text-muted-foreground">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Receipt className="h-3 w-3" />
                      Receita
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {brl(evt.revenueCents)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
