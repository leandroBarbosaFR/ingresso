import Link from "next/link";
import { CalendarHeart, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sobre — Ingressos",
  description: "Quem somos e como ajudamos a venda de ingressos no Brasil.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 px-4 py-12">
      <section className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Sobre nós
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Eventos brasileiros que rodam sem dor de cabeça.
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          A Ingressos é uma plataforma feita por produtores, para produtores —
          com NFS-e automática, repasse rápido por Pix ou cartão e relatórios
          em tempo real.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Block icon={CalendarHeart} title="O que fazemos">
          Vendemos ingressos, geramos NFS-e em nome do produtor, repassamos os
          valores em D+1 e cuidamos do compliance fiscal — para você focar no
          evento.
        </Block>
        <Block icon={MapPin} title="De onde viemos">
          Nascemos em Florianópolis em 2026 com a missão de simplificar a vida
          dos produtores independentes. Atendemos eventos em todo o Brasil.
        </Block>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="text-xl font-semibold tracking-tight">Em números</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Cidades atendidas" value="20+" />
          <Stat label="Produtores ativos" value="50+" />
          <Stat label="Ingressos por mês" value="10k+" />
          <Stat label="Repasse médio" value="D+1" />
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-border p-6">
        <h2 className="text-xl font-semibold tracking-tight">Fale com a gente</h2>
        <p className="text-sm text-muted-foreground">
          Quer migrar seus eventos? Tem uma dúvida regulatória? Escreve para a
          gente.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a href="mailto:contato@ingressos.local">
            <Button>
              <Mail className="h-4 w-4" /> contato@ingressos.local
            </Button>
          </a>
          <Link href="/produtores">
            <Button variant="outline">Para produtores</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-border p-5">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="space-y-1">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </li>
  );
}
