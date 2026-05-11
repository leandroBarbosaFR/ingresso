import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Building2,
  CalendarRange,
  CircleDollarSign,
  Crown,
  Receipt,
  RefreshCcw,
  Sparkles,
  TicketCheck,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import {
  AreaChart,
  BarList,
  Sparkline,
  VerticalBars,
} from "@/components/admin/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminAnalytics } from "@/lib/data/admin-analytics";
import { brl } from "@/lib/format";

export default async function AdminOverviewPage() {
  const a = await adminAnalytics();
  const revenueSpark = a.dailyRevenue.map((d) => d.value);
  const ordersSpark = a.dailyOrders.map((d) => d.value);
  const last7Revenue = a.dailyRevenue
    .slice(-7)
    .reduce((s, d) => s + d.value, 0);
  const prev7Revenue = a.dailyRevenue
    .slice(-14, -7)
    .reduce((s, d) => s + d.value, 0);
  const revenueDelta =
    prev7Revenue === 0
      ? null
      : Math.round(((last7Revenue - prev7Revenue) / prev7Revenue) * 100);

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Plataforma — visão executiva
          </h1>
          <p className="text-sm text-muted-foreground">
            Receita, vendas, organizadores e crescimento da rede.
          </p>
        </div>
        <Link
          href="/admin/financeiro"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver financeiro detalhado →
        </Link>
      </header>

      {/* ───────────────── KPIs ───────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita bruta"
          value={brl(a.totals.grossRevenueCents)}
          icon={CircleDollarSign}
          spark={revenueSpark}
          delta={revenueDelta}
          deltaLabel="vs. 7d anterior"
        />
        <KpiCard
          label="Pedidos pagos"
          value={a.totals.paidOrders.toString()}
          icon={Receipt}
          spark={ordersSpark}
        />
        <KpiCard
          label="Ingressos vendidos"
          value={a.totals.ticketsSold.toString()}
          icon={TicketCheck}
        />
        <KpiCard
          label="Ticket médio"
          value={brl(a.totals.avgOrderCents)}
          icon={Banknote}
          hint={`${a.totals.refundedCount} reembolsos · ${brl(a.totals.refundedCents)}`}
        />
      </div>

      {/* ───────────────── Charts ───────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="text-emerald-600 dark:text-emerald-400">
          <CardHeader className="pb-2 text-foreground">
            <CardTitle className="text-base">Receita últimos 30 dias</CardTitle>
            <CardDescription>
              Soma diária dos pedidos pagos.{" "}
              {revenueDelta !== null ? (
                <span className={revenueDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                  {revenueDelta >= 0 ? "+" : ""}{revenueDelta}% vs. 7d
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={a.dailyRevenue}
              formatValue={(v) => brl(v)}
              tooltipPrefix=""
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{a.dailyRevenue[0]?.date}</span>
              <span>{a.dailyRevenue[a.dailyRevenue.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pedidos por dia</CardTitle>
            <CardDescription>
              {a.totals.paidOrders} pedidos pagos no total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerticalBars data={a.dailyOrders} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>30 dias atrás</span>
              <span>hoje</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── Distributions ───────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por coleção</CardTitle>
            <CardDescription>
              Quais categorias estão movimentando dinheiro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={a.revenueByCategory.map((r) => ({
                label: r.slug,
                value: r.revenueCents,
                hint: `${r.orders} pedidos`,
              }))}
              formatValue={(v) => brl(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métodos de pagamento</CardTitle>
            <CardDescription>Distribuição dos pedidos pagos.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={a.paymentMix.map((p) => ({
                label: paymentLabel(p.method),
                value: p.revenueCents,
                hint: `${p.orders} pedidos`,
              }))}
              formatValue={(v) => brl(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── Top performers ───────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4 text-amber-500" />
              Top organizadores
            </CardTitle>
            <CardDescription>
              Os 5 que mais receberam nos últimos 30 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {a.topOrganizers.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Sem vendas ainda.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {a.topOrganizers.map((o, i) => (
                  <div
                    key={o.id}
                    className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[24px_1fr_auto_auto]"
                  >
                    <span className="text-xs text-muted-foreground tabular-nums">
                      #{i + 1}
                    </span>
                    <p className="truncate text-sm font-medium">{o.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {o.eventCount}{" "}
                      {o.eventCount === 1 ? "evento" : "eventos"}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {brl(o.revenueCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              Top eventos
            </CardTitle>
            <CardDescription>Mais ingressos vendidos.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {a.topEvents.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Sem vendas ainda.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {a.topEvents.map((e, i) => {
                  const pct =
                    e.total === 0
                      ? 0
                      : Math.round((e.sold / e.total) * 100);
                  return (
                    <Link
                      key={e.id}
                      href={`/e/${e.slug}`}
                      target="_blank"
                      className="grid items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[24px_1fr_auto_auto]"
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">
                        #{i + 1}
                      </span>
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {e.sold}/{e.total} · {pct}%
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {brl(e.revenueCents)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── Catalog + growth ───────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4" />
              Catálogo de eventos
            </CardTitle>
            <CardDescription>
              {a.events.total}{" "}
              {a.events.total === 1 ? "evento criado" : "eventos criados"} na
              plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Pill tone="default" label="Publicados" value={a.events.published} />
            <Pill tone="secondary" label="Rascunhos" value={a.events.draft} />
            <Pill tone="outline" label="Encerrados" value={a.events.finished} />
            <Pill
              tone="outline"
              label="Cancelados"
              value={a.events.cancelled}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Crescimento
            </CardTitle>
            <CardDescription>
              Novidades nos últimos dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GrowthBlock
              icon={UserPlus}
              label="Usuários 7d"
              value={a.growth.newUsers7d}
            />
            <GrowthBlock
              icon={UserPlus}
              label="Usuários 30d"
              value={a.growth.newUsers30d}
            />
            <GrowthBlock
              icon={Building2}
              label="Orgs 30d"
              value={a.growth.newOrganizers30d}
            />
            <GrowthBlock
              icon={CalendarRange}
              label="Eventos 30d"
              value={a.growth.newEvents30d}
            />
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── Refunds ───────────────── */}
      {a.totals.refundedCount > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCcw className="h-4 w-4" />
              Reembolsos
            </CardTitle>
            <CardDescription>
              {a.totals.refundedCount} pedidos reembolsados · total{" "}
              {brl(a.totals.refundedCents)}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  spark,
  delta,
  deltaLabel,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  spark?: number[];
  delta?: number | null;
  deltaLabel?: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {spark ? <Sparkline data={spark} /> : null}
        </div>
        {delta !== undefined && delta !== null ? (
          <p className="flex items-center gap-1 pt-1 text-xs">
            {delta >= 0 ? (
              <ArrowUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ArrowDown className="h-3 w-3 text-destructive" />
            )}
            <span
              className={
                delta >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }
            >
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
            {deltaLabel ? (
              <span className="text-muted-foreground">{deltaLabel}</span>
            ) : null}
          </p>
        ) : hint ? (
          <p className="pt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "secondary" | "outline";
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-3">
      <Badge variant={tone} className="rounded-full">
        {label}
      </Badge>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function GrowthBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function paymentLabel(m: string) {
  switch (m) {
    case "pix":
      return "Pix";
    case "credit_card":
      return "Cartão de crédito";
    case "debit_card":
      return "Cartão de débito";
    default:
      return "Outros";
  }
}
