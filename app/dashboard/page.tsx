import {
  CalendarDays,
  Receipt,
  TicketCheck,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Receita (30 dias)",
    value: "R$ 12.450,00",
    delta: "+18%",
    icon: TrendingUp,
  },
  {
    label: "Ingressos vendidos",
    value: "284",
    delta: "+24",
    icon: Receipt,
  },
  {
    label: "Eventos ativos",
    value: "3",
    delta: "1 esta semana",
    icon: CalendarDays,
  },
  {
    label: "Taxa de check-in",
    value: "92%",
    delta: "Ótimo",
    icon: TicketCheck,
  },
];

const upcomingEvents = [
  { title: "Show de Jazz na Praia", date: "12 mai · 20h", sold: 124, total: 200 },
  { title: "Workshop de Fotografia", date: "18 mai · 14h", sold: 18, total: 25 },
  { title: "Festa Rooftop Verão", date: "26 mai · 22h", sold: 287, total: 400 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe vendas, eventos e check-ins dos seus eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </div>
                <p className="pt-1 text-xs text-muted-foreground">
                  {stat.delta}
                </p>
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
          {upcomingEvents.map((evt) => {
            const pct = Math.round((evt.sold / evt.total) * 100);
            return (
              <div
                key={evt.title}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{evt.title}</p>
                  <p className="text-xs text-muted-foreground">{evt.date}</p>
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
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
