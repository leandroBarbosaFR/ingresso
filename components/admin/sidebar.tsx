"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarRange,
  CircleDollarSign,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/financeiro", label: "Financeiro", icon: CircleDollarSign },
  { href: "/admin/organizadores", label: "Organizadores", icon: Building2 },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarRange },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card/30 md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <Shield className="h-4 w-4 text-orange-500" />
        <Link href="/admin" className="font-semibold tracking-tight">
          Ingressos&nbsp;<span className="text-[#ff6900]">+</span>
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            super admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/dashboard"
        className="mx-2 mb-2 flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <LayoutDashboard className="h-4 w-4" />
        Painel do produtor
      </Link>
      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        Plataforma · super admin
      </div>
    </aside>
  );
}
