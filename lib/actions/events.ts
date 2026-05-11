"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v3";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrganizer } from "@/lib/data/organizer";
import { reaisToCents, slugify } from "@/lib/format";

const ticketTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Nome do ingresso obrigatório."),
  description: z.string().trim().optional().nullable(),
  price_reais: z.string().trim(),
  quantity_total: z.coerce.number().int().min(1, "Quantidade mínima 1."),
});

const eventSchema = z
  .object({
    title: z.string().trim().min(2, "Título obrigatório."),
    description: z.string().trim().optional().nullable(),
    cover_url: z.string().trim().url("URL inválida.").optional().nullable(),
    category: z.string().trim().optional().nullable(),
    venue_name: z.string().trim().min(1, "Local obrigatório."),
    venue_address: z.string().trim().min(1, "Endereço obrigatório."),
    venue_city: z.string().trim().min(1, "Cidade obrigatória."),
    venue_state: z
      .string()
      .trim()
      .length(2, "UF deve ter 2 letras.")
      .transform((s) => s.toUpperCase()),
    starts_at: z.string().trim().min(1, "Data de início obrigatória."),
    ends_at: z.string().trim().optional().nullable(),
    status: z.enum(["draft", "published", "cancelled", "finished"]),
  })
  .superRefine((data, ctx) => {
    if (!data.ends_at) return;
    const start = new Date(data.starts_at).getTime();
    const end = new Date(data.ends_at).getTime();
    if (Number.isNaN(end) || Number.isNaN(start)) return;
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ends_at"],
        message: "Término deve ser depois do início.",
      });
    }
  });

export type EventActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createEvent(
  _prev: EventActionResult | null,
  formData: FormData
): Promise<EventActionResult> {
  const { organizer } = await requireOrganizer();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: emptyToNull(formData.get("description")),
    cover_url: emptyToNull(formData.get("cover_url")),
    category: emptyToNull(formData.get("category")),
    venue_name: formData.get("venue_name"),
    venue_address: formData.get("venue_address"),
    venue_city: formData.get("venue_city"),
    venue_state: formData.get("venue_state"),
    starts_at: formData.get("starts_at"),
    ends_at: emptyToNull(formData.get("ends_at")),
    status: formData.get("status") ?? "draft",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const ticketTypes = parseTicketTypes(formData);
  if (ticketTypes.length === 0) {
    return { ok: false, error: "Adicione ao menos um tipo de ingresso." };
  }

  const supabase = await createClient();
  const slug = await uniqueSlug(parsed.data.title);

  const { data: event, error: insertErr } = await supabase
    .from("events")
    .insert({
      ...parsed.data,
      organizer_id: organizer.id,
      slug,
      starts_at: new Date(parsed.data.starts_at).toISOString(),
      ends_at: parsed.data.ends_at
        ? new Date(parsed.data.ends_at).toISOString()
        : null,
    })
    .select("id")
    .single();
  if (insertErr || !event) {
    return { ok: false, error: insertErr?.message ?? "Falha ao criar evento." };
  }

  const { error: ttErr } = await supabase.from("ticket_types").insert(
    ticketTypes.map((tt, idx) => ({
      event_id: event.id,
      name: tt.name,
      description: tt.description,
      price_cents: reaisToCents(tt.price_reais),
      quantity_total: tt.quantity_total,
      position: idx,
    }))
  );
  if (ttErr) return { ok: false, error: ttErr.message };

  revalidatePath("/dashboard/eventos");
  revalidatePath("/dashboard");
  redirect(`/dashboard/eventos/${event.id}`);
}

export async function updateEvent(
  eventId: string,
  _prev: EventActionResult | null,
  formData: FormData
): Promise<EventActionResult> {
  const { organizer } = await requireOrganizer();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: emptyToNull(formData.get("description")),
    cover_url: emptyToNull(formData.get("cover_url")),
    category: emptyToNull(formData.get("category")),
    venue_name: formData.get("venue_name"),
    venue_address: formData.get("venue_address"),
    venue_city: formData.get("venue_city"),
    venue_state: formData.get("venue_state"),
    starts_at: formData.get("starts_at"),
    ends_at: emptyToNull(formData.get("ends_at")),
    status: formData.get("status") ?? "draft",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      ...parsed.data,
      starts_at: new Date(parsed.data.starts_at).toISOString(),
      ends_at: parsed.data.ends_at
        ? new Date(parsed.data.ends_at).toISOString()
        : null,
    })
    .eq("id", eventId)
    .eq("organizer_id", organizer.id);
  if (error) return { ok: false, error: error.message };

  // sync ticket types: existing rows updated, new rows inserted, removed rows deleted
  const incoming = parseTicketTypes(formData);
  const { data: existing } = await supabase
    .from("ticket_types")
    .select("id")
    .eq("event_id", eventId);
  const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
  const incomingIds = new Set(incoming.filter((t) => t.id).map((t) => t.id!));
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (toDelete.length > 0) {
    await supabase.from("ticket_types").delete().in("id", toDelete);
  }

  for (let i = 0; i < incoming.length; i++) {
    const tt = incoming[i];
    const payload = {
      event_id: eventId,
      name: tt.name,
      description: tt.description,
      price_cents: reaisToCents(tt.price_reais),
      quantity_total: tt.quantity_total,
      position: i,
    };
    if (tt.id) {
      await supabase.from("ticket_types").update(payload).eq("id", tt.id);
    } else {
      await supabase.from("ticket_types").insert(payload);
    }
  }

  revalidatePath(`/dashboard/eventos/${eventId}`);
  revalidatePath("/dashboard/eventos");
  return { ok: true, id: eventId };
}

export async function deleteEvent(eventId: string) {
  const { organizer } = await requireOrganizer();
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("organizer_id", organizer.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/eventos");
  redirect("/dashboard/eventos");
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function parseTicketTypes(formData: FormData) {
  // FormData entries named like ticket_types[0][name], ticket_types[0][price_reais], …
  const groups = new Map<string, Record<string, string>>();
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^ticket_types\[(\d+)\]\[(\w+)\]$/);
    if (!m || typeof value !== "string") continue;
    const [, idx, field] = m;
    const grp = groups.get(idx) ?? {};
    grp[field] = value;
    groups.set(idx, grp);
  }
  const items = [...groups.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, v]) => v)
    .filter((v) => v.name?.trim());

  return items
    .map((v) => {
      const parsed = ticketTypeSchema.safeParse({
        id: v.id || undefined,
        name: v.name,
        description: v.description ?? null,
        price_reais: v.price_reais ?? "0",
        quantity_total: v.quantity_total ?? "1",
      });
      return parsed.success ? parsed.data : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "evento";
  const admin = createAdminClient();
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await admin
      .from("events")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}
