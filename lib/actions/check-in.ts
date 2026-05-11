"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrganizer } from "@/lib/data/organizer";

export type CheckInResult =
  | {
      ok: true;
      action: "found" | "marked_used";
      ticket: {
        id: string;
        holder_name: string;
        holder_cpf: string | null;
        status: string;
        used_at: string | null;
        event_title: string;
        ticket_type_name: string;
      };
    }
  | { ok: false; error: string }
  | null;

/**
 * Find by qr_token (UUID) or short prefix and optionally mark as used.
 * Scoped to events owned by the current organizer (RLS bypassed via admin client).
 */
export async function checkInLookup(
  _prev: CheckInResult,
  formData: FormData
): Promise<CheckInResult> {
  const { user, organizer } = await requireOrganizer();
  const token = (formData.get("token") as string | null)?.trim();
  const intent = formData.get("intent") as string | null; // "lookup" | "mark"

  if (!token) return { ok: false, error: "Informe o código do ingresso." };

  const admin = createAdminClient();

  // Validate it's a UUID — qr_token is uuid in schema.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    token
  );
  if (!isUuid) {
    return { ok: false, error: "Código inválido." };
  }

  const { data: ticket, error } = await admin
    .from("tickets")
    .select(
      "id, holder_name, holder_cpf, status, used_at, event_id, ticket_type_id"
    )
    .eq("qr_token", token)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!ticket) return { ok: false, error: "Ingresso não encontrado." };

  // Confirm ownership: event must belong to this organizer.
  const { data: event } = await admin
    .from("events")
    .select("id, title")
    .eq("id", ticket.event_id)
    .eq("organizer_id", organizer.id)
    .maybeSingle();
  if (!event) {
    return { ok: false, error: "Esse ingresso pertence a outro produtor." };
  }

  const { data: tt } = await admin
    .from("ticket_types")
    .select("name")
    .eq("id", ticket.ticket_type_id)
    .maybeSingle();

  if (intent === "mark") {
    if (ticket.status === "used") {
      return { ok: false, error: "Ingresso já foi usado." };
    }
    if (ticket.status !== "valid") {
      return { ok: false, error: `Status atual: ${ticket.status}.` };
    }
    const { data: updated, error: updErr } = await admin
      .from("tickets")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        checked_in_by: user.id,
      })
      .eq("id", ticket.id)
      .select("status, used_at")
      .single();
    if (updErr) return { ok: false, error: updErr.message };
    revalidatePath("/dashboard/check-in");
    revalidatePath("/dashboard/participantes");
    return {
      ok: true,
      action: "marked_used",
      ticket: {
        id: ticket.id,
        holder_name: ticket.holder_name,
        holder_cpf: ticket.holder_cpf,
        status: updated.status,
        used_at: updated.used_at,
        event_title: event.title,
        ticket_type_name: tt?.name ?? "Ingresso",
      },
    };
  }

  return {
    ok: true,
    action: "found",
    ticket: {
      id: ticket.id,
      holder_name: ticket.holder_name,
      holder_cpf: ticket.holder_cpf,
      status: ticket.status,
      used_at: ticket.used_at,
      event_title: event.title,
      ticket_type_name: tt?.name ?? "Ingresso",
    },
  };
}
