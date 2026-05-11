"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  requestPhoneOtp,
  saveIdentity,
  verifyPhoneOtp,
  type IdentityResult,
  type OtpRequestResult,
  type OtpVerifyResult,
} from "@/lib/actions/profile";

type Step = "identity" | "phone" | "code";

export function CompleteProfile({
  initialStep,
  next,
}: {
  initialStep: Step;
  next: string;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const [phoneSent, setPhoneSent] = useState<{
    phone: string;
    provider: string;
  } | null>(null);
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-12">
      <Stepper current={step} />

      {step === "identity" ? (
        <IdentityStep onDone={() => setStep("phone")} />
      ) : null}

      {step === "phone" ? (
        <PhoneStep
          onDone={(info) => {
            setPhoneSent(info);
            setStep("code");
          }}
        />
      ) : null}

      {step === "code" && phoneSent ? (
        <CodeStep
          phone={phoneSent.phone}
          provider={phoneSent.provider}
          onResend={() => setStep("phone")}
          onDone={() => {
            toast.success("Telefone verificado.");
            router.push(next);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "identity", label: "Documento" },
    { key: "phone", label: "Telefone" },
    { key: "code", label: "Código" },
  ];
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.key} className="flex items-center gap-2 text-xs">
            <span
              className={
                "flex h-6 w-6 items-center justify-center rounded-full border tabular-nums " +
                (done
                  ? "border-foreground bg-foreground text-background"
                  : active
                    ? "border-foreground"
                    : "border-border text-muted-foreground")
              }
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={
                active
                  ? "font-medium"
                  : done
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 h-px w-5 bg-border" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — identity
// ---------------------------------------------------------------------------

function IdentityStep({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState<IdentityResult, FormData>(
    saveIdentity,
    null
  );
  const [docType, setDocType] = useState<"cpf" | "cnpj" | "passport">("cpf");

  useEffect(() => {
    if (state?.ok) onDone();
    if (state && !state.ok) toast.error(state.error);
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-5">
      <Header
        icon={FileText}
        title="Quase lá!"
        subtitle="Para continuar, escolha o tipo de documento e preencha os dados."
      />

      <div className="space-y-1.5">
        <Label htmlFor="document_type">
          Tipo de documento <span className="text-destructive">*</span>
        </Label>
        <Select
          name="document_type"
          value={docType}
          onValueChange={(v) =>
            v && setDocType(v as "cpf" | "cnpj" | "passport")
          }
        >
          <SelectTrigger id="document_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="cnpj">CNPJ</SelectItem>
            <SelectItem value="passport">Passaporte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="document_number">
          Número do documento <span className="text-destructive">*</span>
        </Label>
        <Input
          id="document_number"
          name="document_number"
          required
          inputMode={docType === "passport" ? "text" : "numeric"}
          autoComplete="off"
          placeholder={
            docType === "cpf"
              ? "000.000.000-00"
              : docType === "cnpj"
                ? "00.000.000/0001-00"
                : "AB1234567"
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="full_name">
          Nome completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="full_name"
          name="full_name"
          required
          autoComplete="name"
          placeholder="Seu nome como no documento"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date_of_birth">
          Data de nascimento <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
        />
      </div>

      <label className="flex items-start gap-2 text-xs">
        <input
          type="checkbox"
          name="terms_accepted"
          required
          className="mt-0.5"
        />
        <span className="text-muted-foreground">
          Ao continuar, você concorda com os{" "}
          <a
            href="/termos"
            target="_blank"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Termos de uso
          </a>{" "}
          e a{" "}
          <a
            href="/privacidade"
            target="_blank"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Política de privacidade
          </a>
          .
        </span>
      </label>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando…" : "Continuar"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — phone
// ---------------------------------------------------------------------------

function PhoneStep({
  onDone,
}: {
  onDone: (info: { phone: string; provider: string }) => void;
}) {
  const [state, action, pending] = useActionState<OtpRequestResult, FormData>(
    requestPhoneOtp,
    null
  );
  const sentRef = useRef(false);

  useEffect(() => {
    if (state?.ok && !sentRef.current) {
      sentRef.current = true;
      onDone({ phone: state.phone, provider: state.provider });
    }
    if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-5">
      <Header
        icon={Phone}
        title="Quase lá!"
        subtitle="Agora precisamos do seu telefone para enviar o código de confirmação."
      />

      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Telefone celular <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(48) 99999-0000"
        />
        <p className="text-xs text-muted-foreground">
          Inclua DDD. Para números fora do Brasil, comece com +.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Canal do código</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="channel"
              value="whatsapp"
              defaultChecked
              className="peer sr-only"
            />
            <div className="rounded-lg border border-border p-3 text-sm peer-checked:border-foreground peer-checked:bg-muted/40">
              <p className="font-medium">WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Precisa estar online.
              </p>
            </div>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="channel"
              value="sms"
              className="peer sr-only"
            />
            <div className="rounded-lg border border-border p-3 text-sm peer-checked:border-foreground peer-checked:bg-muted/40">
              <p className="font-medium">SMS</p>
              <p className="text-xs text-muted-foreground">
                Funciona sem internet.
              </p>
            </div>
          </label>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando…" : "Enviar código"}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos" target="_blank" className="underline">
          Termos de uso
        </a>
        .
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — code
// ---------------------------------------------------------------------------

function CodeStep({
  phone,
  provider,
  onResend,
  onDone,
}: {
  phone: string;
  provider: string;
  onResend: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<OtpVerifyResult, FormData>(
    verifyPhoneOtp,
    null
  );

  useEffect(() => {
    if (state?.ok) onDone();
    if (state && !state.ok) toast.error(state.error);
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-5">
      <Header
        icon={ShieldCheck}
        title="Enviamos um código"
        subtitle={`Digite o código de 6 dígitos enviado para ${phone}.`}
      />

      {provider === "console" ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          Modo dev: o código foi impresso no terminal do servidor (Twilio não
          configurado).
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="code">Código de 6 dígitos</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          minLength={6}
          pattern="[0-9]{6}"
          placeholder="000000"
          className="text-center font-mono text-lg tracking-[0.5em]"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verificando…" : "Confirmar"}
      </Button>

      <div className="flex justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onResend}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Reenviar código
        </button>
        <a
          href="/contato"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Preciso de ajuda
        </a>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Shared header
// ---------------------------------------------------------------------------

function Header({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}
