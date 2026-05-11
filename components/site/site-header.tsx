import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/site/mobile-menu";
import { UserMenu } from "@/components/site/user-menu";
import { createClient } from "@/lib/supabase/server";
import { homeForRole, type UserRole } from "@/lib/data/user";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panelHref = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role) panelHref = homeForRole(profile.role as UserRole);
  }
  const userInfo = user
    ? { email: user.email ?? "", panelHref }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          Ingressos&nbsp;<span className="text-[#ff6900]">+</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/eventos" className="transition-colors hover:text-foreground">
            Eventos
          </Link>
          <Link href="/colecoes" className="transition-colors hover:text-foreground">
            Coleções
          </Link>
          <Link href="/produtores" className="transition-colors hover:text-foreground">
            Para produtores
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Primary CTA — orange. Full label on sm+, icon-only on mobile. */}
          <Link
            href="/dashboard/eventos/novo"
            aria-label="Criar eventos"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#ff6900] px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#ff7a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6900]/40"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Criar eventos</span>
          </Link>

          {/* Desktop-only auth + theme */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {userInfo ? (
              <UserMenu email={userInfo.email} panelHref={userInfo.panelHref} />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>

          {/* Mobile-only hamburger */}
          <MobileMenu user={userInfo} />
        </div>
      </div>
    </header>
  );
}
