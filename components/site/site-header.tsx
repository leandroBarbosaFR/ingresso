import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Ingressos&nbsp;<span className="text-[#ff6900]">+</span>
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
            href="/dashboard/eventos/novo"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#ff6900] px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#ff7a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6900]/40"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Criar eventos</span>
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost" }) + " hidden md:inline-flex"}
          >
            Entrar
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "outline" }) + " hidden md:inline-flex"}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
