"use client";

import * as React from "react";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

type Props = {
  defaultValue?: string;
  onResolved?: (addr: CepAddress) => void;
  onError?: (msg: string) => void;
  className?: string;
};

/**
 * 8-digit Brazilian CEP input. On blur or when the field reaches 8 digits,
 * looks up the address via ViaCEP (free, no API key) and notifies the parent.
 */
export function CepField({
  defaultValue,
  onResolved,
  onError,
  className,
}: Props) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [pending, setPending] = React.useState(false);

  const lookup = React.useCallback(
    async (raw: string) => {
      const digits = raw.replace(/\D/g, "");
      if (digits.length !== 8) return;
      setPending(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = (await res.json()) as
          | (CepAddress & { erro?: boolean })
          | { erro: true };
        if ("erro" in data && data.erro) {
          onError?.("CEP não encontrado.");
          return;
        }
        onResolved?.(data as CepAddress);
      } catch {
        onError?.("Não foi possível consultar o CEP agora.");
      } finally {
        setPending(false);
      }
    },
    [onResolved, onError]
  );

  function format(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }

  return (
    <div className={cn("relative", className)}>
      <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          const next = format(e.target.value);
          setValue(next);
          if (next.replace(/\D/g, "").length === 8) lookup(next);
        }}
        onBlur={() => lookup(value)}
        placeholder="00000-000"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={9}
        className="h-10 pl-9"
        aria-label="CEP"
      />
      {pending ? (
        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
