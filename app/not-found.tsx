import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Página não encontrada — Ingressos",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
          <Compass className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Erro 404
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Não achamos esta página.
          </h1>
          <p className="text-sm text-muted-foreground">
            O link pode ter expirado ou a página foi removida. Continue
            explorando — tem evento bom esperando.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/eventos">
            <Button>Ver eventos</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Voltar para o início</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
