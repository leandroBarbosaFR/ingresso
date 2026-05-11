import {
  Banknote,
  CircleDollarSign,
  PercentCircle,
  RefreshCcw,
  Wallet,
} from "lucide-react";

import { AreaChart, BarList } from "@/components/admin/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminAnalytics } from "@/lib/data/admin-analytics";
import { brl } from "@/lib/format";

export default async function AdminFinancePage() {
  const a = await adminAnalytics();
  const last30 = a.dailyRevenue.reduce((s, d) => s + d.value, 0);
  const last7 = a.dailyRevenue.slice(-7).reduce((s, d) => s + d.value, 0);
  const prev7 = a.dailyRevenue.slice(-14, -7).reduce((s, d) => s + d.value, 0);

  // Take rate = fees / gross
  const takeRate =
    a.totals.grossRevenueCents === 0
      ? 0
      : Math.round(
          (a.totals.feesCents / a.totals.grossRevenueCents) * 1000
        ) / 10;

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Receita, taxas, reembolsos e métodos de pagamento da plataforma.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceCard
          icon={CircleDollarSign}
          label="Receita bruta"
          value={brl(a.totals.grossRevenueCents)}
          hint={`Últimos 30 dias: ${brl(last30)}`}
        />
        <FinanceCard
          icon={PercentCircle}
          label="Taxa total cobrada"
          value={brl(a.totals.feesCents)}
          hint={`Take rate efetivo: ${takeRate}%`}
        />
        <FinanceCard
          icon={Wallet}
          label="Receita líquida (organizadores)"
          value={brl(a.totals.netRevenueCents)}
          hint="Valor repassável após taxas."
        />
        <FinanceCard
          icon={Banknote}
          label="Ticket médio"
          value={brl(a.totals.avgOrderCents)}
          hint={`${a.totals.paidOrders} pedidos pagos`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita diária (30d)</CardTitle>
          <CardDescription>
            7 dias: {brl(last7)} · 7 dias anteriores: {brl(prev7)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart data={a.dailyRevenue} formatValue={(v) => brl(v)} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{a.dailyRevenue[0]?.date}</span>
            <span>{a.dailyRevenue[a.dailyRevenue.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métodos de pagamento</CardTitle>
            <CardDescription>
              Distribuição da receita por meio.
            </CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Por coleção (categoria)
            </CardTitle>
            <CardDescription>
              Quais coleções mais geram receita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={a.revenueByCategory.map((c) => ({
                label: c.slug,
                value: c.revenueCents,
                hint: `${c.orders} pedidos`,
              }))}
              formatValue={(v) => brl(v)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCcw className="h-4 w-4" />
            Reembolsos
          </CardTitle>
          <CardDescription>
            {a.totals.refundedCount} pedidos reembolsados · valor total{" "}
            {brl(a.totals.refundedCents)}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function FinanceCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {hint ? (
          <p className="pt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
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
