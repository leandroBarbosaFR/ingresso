"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Home,
  QrCode,
  Receipt,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/data/user";

const items = [
  { href: "/dashboard", label: "Visão geral", icon: Home },
  { href: "/dashboard/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/dashboard/vendas", label: "Vendas", icon: Receipt },
  { href: "/dashboard/participantes", label: "Participantes", icon: Users },
  { href: "/dashboard/check-in", label: "Check-in", icon: QrCode },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/config", label: "Configurações", icon: Settings },
];

export function DashboardSidebar({ role }: { role?: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card/30 md:flex md:flex-col">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Ingressos&nbsp;<span className="text-[#ff6900]">+</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
      {role === "super_admin" ? (
        <Link
          href="/admin"
          className="mx-2 mb-2 flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Shield className="h-4 w-4" />
          Painel super admin
        </Link>
      ) : null}
      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        {role === "super_admin"
          ? "Painel do produtor"
          : "Painel do produtor"}
      </div>
    </aside>
  );
}
