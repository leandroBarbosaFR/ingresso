"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.53H2.17v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.86 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.36-2.11V7.05H2.17A11 11 0 0 0 1 12c0 1.78.43 3.46 1.17 4.95l3.69-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.17 7.05l3.69 2.84C6.72 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

type Props = {
  redirectTo?: string;
};

export function GoogleButton({ redirectTo }: Props) {
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${
          redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
        }`,
      },
    });
    if (error) {
      toast.error("Não foi possível iniciar o login com Google.");
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signIn}
      disabled={pending}
      className="h-10 w-full justify-center gap-2"
    >
      <GoogleIcon className="h-4 w-4" />
      Continuar com Google
    </Button>
  );
}
