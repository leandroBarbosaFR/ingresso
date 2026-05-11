import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";
import { createAdminClient } from "@/lib/supabase/admin";
import { brl, dateShort } from "@/lib/format";

export default async function RelatoriosPage() {
  const { organizer } = await requireOrganizer();
  const admin = createAdminClient();

  const { data: events } = await admin
    .from("events")
    .select("id, title, starts_at, status")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });
  const ids = (events ?? []).map((e: { id: string }) => e.id);

  type EventStat = {
    id: string;
    title: string;
    starts_at: string;
    status: string;
    sold: number;
    total: number;
    revenueCents: number;
    checkedIn: number;
  };

  const stats = new Map<string, EventStat>(
    (events ?? []).map((e: { id: string; title: string; starts_at: string; status: string }) => [
      e.id,
      {
        id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        status: e.status,
        sold: 0,
        total: 0,
        revenueCents: 0,
        checkedIn: 0,
      },
    ])
  );

  if (ids.length > 0) {
    const { data: tts } = await admin
      .from("ticket_types")
      .select("event_id, quantity_total, quantity_sold")
      .in("event_id", ids);
    (tts ?? []).forEach(
      (t: { event_id: string; quantity_total: number; quantity_sold: number }) => {
        const s = stats.get(t.event_id);
        if (!s) return;
        s.total += t.quantity_total;
        s.sold += t.quantity_sold;
      }
    );

    const { data: paid } = await admin
      .from("orders")
      .select("event_id, total_cents")
      .in("event_id", ids)
      .eq("status", "paid");
    (paid ?? []).forEach(
      (o: { event_id: string; total_cents: number }) => {
        const s = stats.get(o.event_id);
        if (!s) return;
        s.revenueCents += o.total_cents;
      }
    );

    const { data: usedTickets } = await admin
      .from("tickets")
      .select("event_id")
      .in("event_id", ids)
      .eq("status", "used");
    (usedTickets ?? []).forEach((t: { event_id: string }) => {
      const s = stats.get(t.event_id);
      if (s) s.checkedIn += 1;
    });
  }

  const rows = [...stats.values()];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Receita e ocupação por evento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por evento</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Crie um evento para ver relatórios.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => {
                const pct = r.total === 0 ? 0 : Math.round((r.sold / r.total) * 100);
                return (
                  <div key={r.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dateShort(r.starts_at)} · {r.status}
                      </p>
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground sm:block">
                      {r.sold}/{r.total} ({pct}%)
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground sm:block">
                      {r.checkedIn} check-ins
                    </div>
                    <div className="text-right text-sm font-medium tabular-nums">
                      {brl(r.revenueCents)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
