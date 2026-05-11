"use client";

import { useActionState, useEffect } from "react";
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
  updateOrganizer,
  type OrganizerFormState,
} from "@/lib/actions/organizer";
import type { Organizer } from "@/lib/data/organizer";

export function OrganizerForm({ organizer }: { organizer: Organizer }) {
  const [state, formAction, pending] = useActionState<
    OrganizerFormState,
    FormData
  >(updateOrganizer, null);

  useEffect(() => {
    if (state?.ok) toast.success("Configurações salvas.");
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state && !state.ok ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome público</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={organizer.name}
          placeholder="Ex.: 1367 Studio"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="legal_name">Razão social</Label>
          <Input
            id="legal_name"
            name="legal_name"
            defaultValue={organizer.legal_name ?? ""}
            placeholder="Ex.: Studio 1367 LTDA"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            name="cnpj"
            defaultValue={organizer.cnpj ?? ""}
            placeholder="00.000.000/0001-00"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="municipal_registration">Inscrição municipal</Label>
          <Input
            id="municipal_registration"
            name="municipal_registration"
            defaultValue={organizer.municipal_registration ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tax_regime">Regime tributário</Label>
          <Select name="tax_regime" defaultValue={organizer.tax_regime ?? ""}>
            <SelectTrigger id="tax_regime">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
              <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
              <SelectItem value="mei">MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
