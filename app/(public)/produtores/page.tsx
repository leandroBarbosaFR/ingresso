import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Receipt,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Para produtores — Ingressos",
  description:
    "Crie e venda ingressos online com NFS-e automática, repasse rápido e relatórios em tempo real.",
};

const features = [
  {
    icon: Ticket,
    title: "Ingressos com QR único",
    body: "QR code por participante, leitor de check-in e validação anti-fraude inclusos.",
  },
  {
    icon: Wallet,
    title: "Repasse rápido",
    body: "Pagamentos via Mercado Pago, com Pix e cartão. Receba na sua conta em D+1.",
  },
  {
    icon: Receipt,
    title: "NFS-e automática",
    body: "Emissão automática via PlugNotas para Simples Nacional, Lucro Presumido e MEI.",
  },
  {
    icon: BarChart3,
    title: "Relatórios em tempo real",
    body: "Vendas, ocupação, check-ins e receita por evento — atualizados a cada minuto.",
  },
  {
    icon: ShieldCheck,
    title: "Reembolso conforme CDC",
    body: "Janela de 7 dias respeitada com 1 clique, sem dor de cabeça com a regulação.",
  },
  {
    icon: Sparkles,
    title: "Página pública impecável",
    body: "Cada evento ganha uma URL bonita pronta para compartilhar nas redes sociais.",
  },
];

export default function ProdutoresPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-16 px-4 py-12 sm:py-20">
      <section className="space-y-6 text-center">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Para produtores
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Venda ingressos sem dor de cabeça.
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          Da página pública à NFS-e, tudo o que você precisa para colocar seu
          evento à venda em minutos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/signup">
            <Button size="lg">
              Criar conta de organizador
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/eventos">
            <Button size="lg" variant="outline">
              Ver eventos publicados
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title}>
              <CardContent className="space-y-3 pt-6">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-base font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-6 rounded-2xl border border-border bg-muted/30 p-6 sm:p-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Como funciona
          </h2>
          <p className="text-sm text-muted-foreground">
            Em três passos seu evento já está vendendo.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          <Step n={1} title="Crie sua conta">
            Confirme seu e-mail, defina nome público e regime tributário.
          </Step>
          <Step n={2} title="Cadastre seu evento">
            Local, datas, tipos de ingresso e capa — em uma só tela.
          </Step>
          <Step n={3} title="Compartilhe e venda">
            Receba pelo Mercado Pago, gere NFS-e e acompanhe vendas em tempo
            real.
          </Step>
        </ol>
      </section>

      <section className="space-y-4 rounded-2xl border border-border p-6 sm:p-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Preços</h2>
          <p className="text-sm text-muted-foreground">
            Modelo simples por anúncio. Sem mensalidade, sem fidelidade.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Por anúncio
            </p>
            <p className="text-3xl font-semibold tracking-tight">R$ 0</p>
            <p className="text-sm text-muted-foreground">
              Ative seu primeiro evento gratuitamente.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sobre cada ingresso
            </p>
            <p className="text-3xl font-semibold tracking-tight">7% + R$ 0,99</p>
            <p className="text-sm text-muted-foreground">
              Taxa de serviço transparente, paga pelo comprador.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <Link href="/signup">
          <Button size="lg">
            Quero começar agora
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="space-y-2 rounded-xl border border-border bg-card p-5">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background tabular-nums">
        {n}
      </span>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </li>
  );
}
