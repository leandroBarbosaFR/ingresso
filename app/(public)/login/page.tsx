import { Suspense } from "react";
import Link from "next/link";

import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <div className="space-y-2 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta para gerenciar seus ingressos.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleButton />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>ou</span>
          <Separator className="flex-1" />
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="pt-6 text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
