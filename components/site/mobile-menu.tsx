"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/eventos", label: "Eventos" },
  { href: "/colecoes", label: "Coleções" },
  { href: "/produtores", label: "Para produtores" },
];

type Props = {
  user?: { email: string; panelHref: string } | null;
};

export function MobileMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="md:hidden"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader className="space-y-1 pb-2">
          <SheetTitle className="text-base">
            Ingressos&nbsp;<span className="text-[#ff6900]">+</span>
          </SheetTitle>
        </SheetHeader>

        {user ? (
          <div className="mx-4 mt-1 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground">
                Logado como
              </p>
              <p className="truncate text-xs">{user.email}</p>
            </div>
          </div>
        ) : null}

        <nav className="flex flex-col px-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Separator className="my-3" />

        <div className="flex flex-col gap-2 px-4">
          {user ? (
            <>
              <Link
                href={user.panelHref}
                onClick={() => setOpen(false)}
                className={buttonVariants() + " justify-center"}
              >
                Meu painel
              </Link>
              <form action="/auth/sign-out" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-center text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline" }) + " justify-center"}
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className={buttonVariants() + " justify-center"}
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between px-4">
          <span className="text-sm text-muted-foreground">Tema</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="gap-2"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" /> Claro
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" /> Escuro
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
