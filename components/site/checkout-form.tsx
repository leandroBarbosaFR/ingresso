"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Minus, Plus, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDemoOrder, type CheckoutResult } from "@/lib/actions/checkout";
import { brl } from "@/lib/format";

type Props = {
  ticketTypeId: string;
  ticketTypeName: string;
  unitPriceCents: number;
  feePercent: number;
  feeFlatCents: number;
  maxPerPurchase: number;
  availableCount: number;
};

export function CheckoutForm({
  ticketTypeId,
  ticketTypeName,
  unitPriceCents,
  feePercent,
  feeFlatCents,
  maxPerPurchase,
  availableCount,
}: Props) {
  const cap = Math.min(maxPerPurchase, Math.max(1, availableCount));
  const [qty, setQty] = useState(1);
  const [state, formAction, pending] = useActionState<
    CheckoutResult | null,
    FormData
  >(createDemoOrder, null);

  const lastError = useRef<string | null>(null);
  useEffect(() => {
    if (state && !state.ok && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error);
    }
  }, [state]);

  const subtotal = unitPriceCents * qty;
  const fees = Math.round((subtotal * feePercent) / 100) + feeFlatCents * qty;
  const total = subtotal + fees;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="ticket_type_id" value={ticketTypeId} />
      <input type="hidden" name="quantity" value={qty} />

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Quantidade
        </h2>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || pending}
            aria-label="Diminuir"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[2ch] text-center text-xl font-semibold tabular-nums">
            {qty}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQty((q) => Math.min(cap, q + 1))}
            disabled={qty >= cap || pending}
            aria-label="Aumentar"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Máx. {cap} por compra
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Seus dados
        </h2>
        <p className="text-xs text-muted-foreground">
          Esses dados aparecem no ingresso e no recibo.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="buyer_name">Nome completo *</Label>
          <Input
            id="buyer_name"
            name="buyer_name"
            required
            autoComplete="name"
            placeholder="João da Silva"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="buyer_email">E-mail *</Label>
            <Input
              id="buyer_email"
              name="buyer_email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer_cpf">CPF *</Label>
            <Input
              id="buyer_cpf"
              name="buyer_cpf"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyer_phone">Telefone (opcional)</Label>
          <Input
            id="buyer_phone"
            name="buyer_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(48) 99999-0000"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h2 className="text-base font-semibold tracking-tight">Resumo</h2>
        <Row label={`${ticketTypeName} × ${qty}`} value={brl(subtotal)} />
        <Row
          label={`Taxa de serviço (${feePercent}% + ${brl(feeFlatCents)}/ingresso)`}
          value={brl(fees)}
          muted
        />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-medium">Total</span>
          <span className="text-xl font-semibold tabular-nums">
            {brl(total)}
          </span>
        </div>
      </section>

      <Button type="submit" className="w-full" disabled={pending} size="lg">
        <Lock className="h-4 w-4" />
        {pending ? "Processando…" : `Pagar (demo) · ${brl(total)}`}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Modo demo: nenhum pagamento real é processado. Você receberá ingressos
        com QR válidos para o check-in.
      </p>
    </form>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span
        className={
          "tabular-nums " + (muted ? "text-muted-foreground" : "font-medium")
        }
      >
        {value}
      </span>
    </div>
  );
}
