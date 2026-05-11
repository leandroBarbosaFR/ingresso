"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";

import { createClient } from "@/lib/supabase/server";
import { requireOrganizer } from "@/lib/data/organizer";

const schema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório."),
  legal_name: z.string().trim().optional().nullable(),
  cnpj: z.string().trim().optional().nullable(),
  municipal_registration: z.string().trim().optional().nullable(),
  tax_regime: z
    .enum(["simples_nacional", "lucro_presumido", "mei"])
    .nullable()
    .optional(),
});

export type OrganizerFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function updateOrganizer(
  _prev: OrganizerFormState,
  formData: FormData
): Promise<OrganizerFormState> {
  const { organizer } = await requireOrganizer();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    legal_name: emptyToNull(formData.get("legal_name")),
    cnpj: emptyToNull(formData.get("cnpj")),
    municipal_registration: emptyToNull(formData.get("municipal_registration")),
    tax_regime: emptyToNull(formData.get("tax_regime")) as
      | "simples_nacional"
      | "lucro_presumido"
      | "mei"
      | null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizers")
    .update(parsed.data)
    .eq("id", organizer.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/config");
  revalidatePath("/dashboard");
  return { ok: true };
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}
