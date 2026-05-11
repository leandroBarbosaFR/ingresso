import { Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";
import { createAdminClient } from "@/lib/supabase/admin";
import { brl, dateTime } from "@/lib/format";

const statusLabel: Record<string, { label: string; tone: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", tone: "secondary" },
  paid: { label: "Pago", tone: "default" },
  failed: { label: "Falhou", tone: "destructive" },
  refunded: { label: "Reembolsado", tone: "outline" },
  expired: { label: "Expirado", tone: "outline" },
};

export default async function VendasPage() {
  const { organizer } = await requireOrganizer();
  const admin = createAdminClient();

  const { data: events } = await admin
    .from("events")
    .select("id, title")
    .eq("organizer_id", organizer.id);
  const eventMap = new Map(
    (events ?? []).map((e: { id: string; title: string }) => [e.id, e.title])
  );
  const ids = (events ?? []).map((e: { id: string }) => e.id);

  const orders = ids.length
    ? (
        await admin
          .from("orders")
          .select(
            "id, event_id, buyer_name, buyer_email, total_cents, status, payment_method, created_at, paid_at"
          )
          .in("event_id", ids)
          .order("created_at", { ascending: false })
          .limit(200)
      ).data
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
        <p className="text-sm text-muted-foreground">
          Pedidos recentes em todos os seus eventos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!orders || orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Ainda não há pedidos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map(
                (o: {
                  id: string;
                  event_id: string;
                  buyer_name: string;
                  buyer_email: string;
                  total_cents: number;
                  status: string;
                  payment_method: string | null;
                  created_at: string;
                  paid_at: string | null;
                }) => {
                  const meta = statusLabel[o.status] ?? statusLabel.pending;
                  return (
                    <div
                      key={o.id}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {o.buyer_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.buyer_email} ·{" "}
                          {eventMap.get(o.event_id) ?? "Evento"} ·{" "}
                          {dateTime(o.created_at)}
                        </p>
                      </div>
                      <div className="hidden text-xs text-muted-foreground sm:block">
                        {o.payment_method ?? "—"}
                      </div>
                      <div className="w-28 shrink-0 text-right text-sm tabular-nums">
                        {brl(o.total_cents)}
                      </div>
                      <Badge variant={meta.tone}>{meta.label}</Badge>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
