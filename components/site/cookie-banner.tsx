"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-v1";

type Consent = "accepted" | "rejected";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function decide(consent: Consent) {
    try {
      window.localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // localStorage may be blocked — banner just won't reappear in this session
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Usamos cookies para melhorar sua experiência, personalizar conteúdo e
          analisar o tráfego. Saiba mais na nossa{" "}
          <Link
            href="/privacidade"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => decide("rejected")}>
            Recusar
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
