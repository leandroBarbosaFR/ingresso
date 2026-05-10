import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type Props = {
  email?: string;
};

export function DashboardHeader({ email }: Props) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <div className="ml-auto flex items-center gap-3">
        {email && (
          <span className="hidden text-sm text-muted-foreground md:inline">
            {email}
          </span>
        )}
        <ThemeToggle />
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
