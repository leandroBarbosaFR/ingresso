"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { safeNext } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres."),
});

type Schema = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const surfacedError = useRef(false);
  useEffect(() => {
    if (surfacedError.current) return;
    const err = searchParams.get("error");
    if (err === "oauth") {
      toast.error("Não foi possível concluir o login com Google.");
      surfacedError.current = true;
    }
  }, [searchParams]);

  async function onSubmit(values: Schema) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      toast.error("Não foi possível entrar. Verifique e-mail e senha.");
      setPending(false);
      return;
    }
    toast.success("Bem-vindo de volta!");
    const next = safeNext(searchParams.get("next"), "/dashboard");
    router.push(next);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending} className="h-10 w-full">
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
