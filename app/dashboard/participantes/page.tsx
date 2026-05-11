import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateTime } from "@/lib/format";

const statusLabel: Record<string, { label: string; tone: "default" | "secondary" | "outline" }> = {
  valid: { label: "Válido", tone: "default" },
  used: { label: "Usado", tone: "secondary" },
  cancelled: { label: "Cancelado", tone: "outline" },
};

export default async function ParticipantesPage() {
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

  const tickets = ids.length
    ? (
        await admin
          .from("tickets")
          .select(
            "id, event_id, holder_name, holder_cpf, status, used_at, created_at"
          )
          .in("event_id", ids)
          .order("created_at", { ascending: false })
          .limit(500)
      ).data
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Participantes
        </h1>
        <p className="text-sm text-muted-foreground">
          Quem comprou ingressos nos seus eventos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingressos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!tickets || tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum ingresso emitido ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tickets.map(
                (t: {
                  id: string;
                  event_id: string;
                  holder_name: string;
                  holder_cpf: string | null;
                  status: string;
                  used_at: string | null;
                  created_at: string;
                }) => {
                  const meta = statusLabel[t.status] ?? statusLabel.valid;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.holder_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {eventMap.get(t.event_id) ?? "Evento"} · emitido em{" "}
                          {dateTime(t.created_at)}
                          {t.used_at ? ` · usado em ${dateTime(t.used_at)}` : ""}
                        </p>
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
