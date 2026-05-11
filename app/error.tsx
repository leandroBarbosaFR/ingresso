"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console for debugging in dev. In prod a logger
    // would forward this to an observability backend.
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Algo deu errado.
          </h1>
          <p className="text-sm text-muted-foreground">
            Tivemos um problema ao carregar esta página. Tente novamente — se
            persistir, recarregue a aba.
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">
              ref: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => reset()}>Tentar novamente</Button>
          <Button variant="outline" onClick={() => location.assign("/")}>
            Ir para início
          </Button>
        </div>
      </div>
    </div>
  );
}
