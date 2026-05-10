import Link from "next/link";
import { Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Ingressos
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link
            href="/eventos"
            className="transition-colors hover:text-foreground"
          >
            Eventos
          </Link>
          <Link
            href="/colecoes"
            className="transition-colors hover:text-foreground"
          >
            Coleções
          </Link>
          <Link
            href="/produtores"
            className="transition-colors hover:text-foreground"
          >
            Para produtores
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Buscar" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost" }) + " hidden md:inline-flex"}
          >
            Entrar
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
