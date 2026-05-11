"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, ScanLine, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkInLookup,
  type CheckInResult,
} from "@/lib/actions/check-in";
import { dateTime } from "@/lib/format";

export function CheckInForm() {
  const [state, formAction, pending] = useActionState<CheckInResult, FormData>(
    checkInLookup,
    null
  );
  const tokenRef = useRef<HTMLInputElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);

  function setIntent(next: "lookup" | "mark") {
    if (intentRef.current) intentRef.current.value = next;
  }

  const lastActionRef = useRef<string | null>(null);
  useEffect(() => {
    if (!state) return;
    const key = state.ok ? `ok:${state.action}` : `err:${state.error}`;
    if (lastActionRef.current === key) return;
    lastActionRef.current = key;
    if (state.ok && state.action === "marked_used") {
      toast.success("Check-in registrado.");
    } else if (!state.ok) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="token" className="text-sm">
          Código do ingresso (UUID do QR)
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="token"
            name="token"
            ref={tokenRef}
            placeholder="00000000-0000-0000-0000-000000000000"
            autoComplete="off"
            spellCheck={false}
            required
            className="font-mono text-xs"
          />
          <input
            type="hidden"
            name="intent"
            ref={intentRef}
            defaultValue="lookup"
          />
          <Button
            type="submit"
            disabled={pending}
            onClick={() => setIntent("lookup")}
          >
            <ScanLine className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {state && !state.ok ? (
        <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {state && state.ok ? (
        <Result
          state={state}
          pending={pending}
          onConfirm={() => setIntent("mark")}
        />
      ) : null}
    </form>
  );
}

function Result({
  state,
  pending,
  onConfirm,
}: {
  state: Extract<CheckInResult, { ok: true }>;
  pending: boolean;
  onConfirm: () => void;
}) {
  const t = state.ticket;
  const isUsed = t.status === "used";
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{t.holder_name}</p>
          <p className="text-sm text-muted-foreground">
            {t.event_title} · {t.ticket_type_name}
          </p>
          {t.holder_cpf ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {t.holder_cpf}
            </p>
          ) : null}
        </div>
        <Badge variant={isUsed ? "secondary" : "default"}>{t.status}</Badge>
      </div>

      {state.action === "marked_used" ? (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check-in feito{t.used_at ? ` em ${dateTime(t.used_at)}` : ""}.
        </div>
      ) : isUsed ? (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Já usado em {t.used_at ? dateTime(t.used_at) : "—"}
        </div>
      ) : (
        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          onClick={onConfirm}
        >
          Confirmar check-in
        </Button>
      )}
    </div>
  );
}
