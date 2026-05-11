"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Reads transient `?signed_out=1` / `?next_required=1` style flash params from
 * the URL, fires a single toast, then strips the param so a refresh doesn't
 * re-fire. Wrapped in Suspense because `useSearchParams` opts the tree out
 * of static rendering otherwise.
 */
export function FlashToasts() {
  return (
    <Suspense fallback={null}>
      <FlashToastsInner />
    </Suspense>
  );
}

function FlashToastsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef<string | null>(null);

  useEffect(() => {
    const signedOut = sp.get("signed_out");
    const oauthErr = sp.get("error");

    let message: { kind: "success" | "error"; text: string } | null = null;
    let key: string | null = null;
    if (signedOut) {
      message = { kind: "success", text: "Você saiu da conta." };
      key = `signed_out:${signedOut}`;
    } else if (oauthErr === "oauth" && pathname !== "/login") {
      // Only surface outside /login (the login page already handles it inline)
      message = { kind: "error", text: "Falha no login com Google." };
      key = `oauth:${oauthErr}`;
    }

    if (!message || !key) return;
    if (fired.current === key) return;
    fired.current = key;

    if (message.kind === "success") toast.success(message.text);
    else toast.error(message.text);

    // Strip the flash params so refresh doesn't re-fire.
    const next = new URLSearchParams(sp.toString());
    next.delete("signed_out");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [sp, router, pathname]);

  return null;
}
