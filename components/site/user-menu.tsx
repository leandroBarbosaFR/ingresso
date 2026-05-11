"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  email: string;
  /** "/dashboard" for event_maker/super_admin, "/minha-conta" for client_user */
  panelHref: string;
};

function initialsFor(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserMenu({ email, panelHref }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Conta"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-muted/40 px-1.5 pr-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        }
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {initialsFor(email)}
        </span>
        <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">Logado como</p>
          <p className="truncate text-sm font-medium text-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href={panelHref}>
              <LayoutDashboard className="h-4 w-4" />
              Meu painel
            </Link>
          }
        />
        <DropdownMenuItem
          render={
            <Link href="/dashboard/config">
              <User className="h-4 w-4" />
              Minha conta
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <form action="/auth/sign-out" method="post" className="w-full">
              <button
                type="submit"
                className="flex w-full items-center gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
