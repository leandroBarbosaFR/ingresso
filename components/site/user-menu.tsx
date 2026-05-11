"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
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

// Static id so the hidden signout form can be targeted from anywhere
// without prop drilling.
const SIGNOUT_FORM_ID = "user-menu-signout-form";

export function UserMenu({ email, panelHref }: Props) {
  return (
    <>
      {/* The form lives outside the menu so the menu-item button can submit it
          via the `form` attribute without nesting interactive elements. */}
      <form
        id={SIGNOUT_FORM_ID}
        action="/auth/sign-out"
        method="post"
        className="hidden"
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              aria-label="Conta"
              className="rounded-full gap-2 pl-1.5 pr-3"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                {initialsFor(email)}
              </span>
              <span className="hidden max-w-[160px] truncate text-xs font-normal text-muted-foreground lg:inline">
                {email}
              </span>
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="min-w-60">
          <DropdownMenuLabel className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Logado como
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {email}
            </p>
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
              <button
                type="submit"
                form={SIGNOUT_FORM_ID}
                className="text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
