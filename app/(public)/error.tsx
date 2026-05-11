"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public segment error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Não foi possível carregar.
        </h1>
        <p className="text-sm text-muted-foreground">
          Tivemos um problema ao buscar os dados. Tente novamente em alguns
          segundos.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            ref: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Link href="/eventos">
          <Button variant="outline">Ver eventos</Button>
        </Link>
      </div>
    </div>
  );
}
