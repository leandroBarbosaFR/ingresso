import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateShort } from "@/lib/format";
import { listAllEvents } from "@/lib/data/admin";

const tone: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  cancelled: "outline",
  finished: "outline",
};

export default async function AdminEventsPage() {
  const events = await listAllEvents();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Todos os eventos publicados ou em rascunho na plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista global</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum evento criado ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[2fr_2fr_auto_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{evt.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {evt.organizer_name}
                    </p>
                  </div>
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <p>{dateShort(evt.starts_at)}</p>
                    <p>
                      {evt.venue_city}/{evt.venue_state}
                    </p>
                  </div>
                  <Badge variant={tone[evt.status] ?? "secondary"}>
                    {evt.status}
                  </Badge>
                  {evt.status === "published" ? (
                    <Link
                      href={`/e/${evt.slug}`}
                      target="_blank"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ver →
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
