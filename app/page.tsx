import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight">Ingressos</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Em breve: lista de eventos disponíveis.
          </p>
        </div>
      </main>
    </div>
  );
}
