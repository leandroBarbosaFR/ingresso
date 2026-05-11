import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Receipt,
  TicketCheck,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";
import { organizerStats, upcomingEvents } from "@/lib/data/events";
import { brl, dateShort } from "@/lib/format";

export default async function DashboardPage() {
  const { organizer } = await requireOrganizer();
  const [stats, upcoming] = await Promise.all([
    organizerStats(organizer.id),
    upcomingEvents(organizer.id, 5),
  ]);

  const cards = [
    {
      label: "Receita (30 dias)",
      value: brl(stats.revenueCents),
      icon: TrendingUp,
    },
    {
      label: "Ingressos vendidos",
      value: stats.ticketsSold.toString(),
      icon: Receipt,
    },
    {
      label: "Eventos publicados",
      value: stats.activeEvents.toString(),
      icon: CalendarDays,
    },
    {
      label: "Taxa de check-in",
      value: `${stats.checkInRate}%`,
      icon: TicketCheck,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Olá, {organizer.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe vendas, eventos e check-ins.
          </p>
        </div>
        <Link href="/dashboard/eventos/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
          <CardDescription>
            Acompanhe a venda de ingressos antes da data.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {upcoming.length === 0 ? (
            <EmptyEvents />
          ) : (
            upcoming.map((evt) => {
              const pct =
                evt.total === 0 ? 0 : Math.round((evt.sold / evt.total) * 100);
              return (
                <Link
                  key={evt.id}
                  href={`/dashboard/eventos/${evt.id}`}
                  className="flex items-center gap-4 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateShort(evt.starts_at)}
                    </p>
                  </div>
                  <div className="hidden w-40 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 shrink-0 text-right text-sm tabular-nums">
                    {evt.sold} / {evt.total}
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Você ainda não tem eventos publicados.
      </p>
      <Link href="/dashboard/eventos/novo">
        <Button size="sm">
          <Plus className="h-4 w-4" /> Criar primeiro evento
        </Button>
      </Link>
    </div>
  );
}
