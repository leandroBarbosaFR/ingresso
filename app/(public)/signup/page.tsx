import Link from "next/link";

import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <div className="space-y-2 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Em segundos. Receba seus ingressos por e-mail.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleButton />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>ou</span>
          <Separator className="flex-1" />
        </div>

        <SignupForm />
      </div>

      <p className="pt-6 text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>

      <p className="pt-4 text-xs text-muted-foreground">
        Ao criar uma conta, você concorda com os{" "}
        <Link href="/termos" className="underline-offset-4 hover:underline">
          Termos de uso
        </Link>{" "}
        e a{" "}
        <Link
          href="/privacidade"
          className="underline-offset-4 hover:underline"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
