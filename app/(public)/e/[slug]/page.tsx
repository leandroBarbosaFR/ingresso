import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { brl, dateTime } from "@/lib/format";

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, slug, title, description, cover_url, category, venue_name, venue_address, venue_city, venue_state, starts_at, ends_at, status"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!event) notFound();

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select(
      "id, name, description, price_cents, quantity_total, quantity_sold, sales_start_at, sales_end_at"
    )
    .eq("event_id", event.id)
    .order("position", { ascending: true });

  const visibleTicketTypes = (ticketTypes ?? []).filter(
    (tt: { sales_start_at: string | null; sales_end_at: string | null }) => {
      const now = Date.now();
      if (tt.sales_start_at && new Date(tt.sales_start_at).getTime() > now)
        return false;
      if (tt.sales_end_at && new Date(tt.sales_end_at).getTime() < now)
        return false;
      return true;
    }
  );

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        <div className="relative aspect-[16/9] w-full">
          {event.cover_url ? (
            <Image
              src={event.cover_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>
      </div>

      <header className="space-y-3">
        {event.category ? (
          <Badge variant="secondary" className="rounded-full">
            {event.category}
          </Badge>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateTime(event.starts_at)}
            {event.ends_at ? ` — ${dateTime(event.ends_at)}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.venue_name} · {event.venue_city}/{event.venue_state}
          </span>
        </div>
      </header>

      {event.description ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Ingressos</h2>
        {visibleTicketTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Vendas indisponíveis no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleTicketTypes.map(
              (tt: {
                id: string;
                name: string;
                description: string | null;
                price_cents: number;
                quantity_total: number;
                quantity_sold: number;
              }) => {
                const remaining = tt.quantity_total - tt.quantity_sold;
                const soldOut = remaining <= 0;
                return (
                  <div
                    key={tt.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{tt.name}</p>
                      {tt.description ? (
                        <p className="text-sm text-muted-foreground">
                          {tt.description}
                        </p>
                      ) : null}
                      {soldOut ? (
                        <p className="pt-1 text-xs text-destructive">Esgotado</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums">
                        {brl(tt.price_cents)}
                      </p>
                    </div>
                    {soldOut ? (
                      <Button disabled>Esgotado</Button>
                    ) : (
                      <Link href={`/checkout?tt=${tt.id}`}>
                        <Button>Comprar</Button>
                      </Link>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
        <h3 className="text-base font-medium text-foreground">Local</h3>
        <p>{event.venue_name}</p>
        <p>{event.venue_address}</p>
        <p>
          {event.venue_city} · {event.venue_state}
        </p>
      </section>
    </article>
  );
}
