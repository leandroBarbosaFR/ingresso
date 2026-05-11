"use server";

import { redirect } from "next/navigation";
import { z } from "zod/v3";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTicketEmail } from "@/lib/email/send-ticket";
import { dateShort } from "@/lib/format";

const schema = z.object({
  ticket_type_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
  buyer_name: z.string().trim().min(2, "Informe seu nome."),
  buyer_email: z.string().email("E-mail inválido."),
  buyer_cpf: z
    .string()
    .trim()
    .min(11, "CPF inválido.")
    .max(14, "CPF inválido."),
  buyer_phone: z.string().trim().optional(),
});

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

/**
 * Demo checkout. Validates + reserves stock + marks the order as paid in one
 * transaction-like sequence. No real money moves. Redirects to /pedido/[id]
 * on success.
 *
 * For prod this will be replaced by: create order (status=pending) → create
 * MP preference → return checkout URL → webhook flips status to paid →
 * tickets emitted + e-mail sent.
 */
export async function createDemoOrder(
  _prev: CheckoutResult | null,
  formData: FormData
): Promise<CheckoutResult> {
  const parsed = schema.safeParse({
    ticket_type_id: formData.get("ticket_type_id"),
    quantity: formData.get("quantity"),
    buyer_name: formData.get("buyer_name"),
    buyer_email: formData.get("buyer_email"),
    buyer_cpf: formData.get("buyer_cpf"),
    buyer_phone: formData.get("buyer_phone"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();

  // 1. Load ticket type + event
  const { data: tt, error: ttErr } = await admin
    .from("ticket_types")
    .select(
      "id, event_id, name, price_cents, quantity_total, quantity_sold, sales_start_at, sales_end_at"
    )
    .eq("id", parsed.data.ticket_type_id)
    .maybeSingle();
  if (ttErr) return { ok: false, error: ttErr.message };
  if (!tt) return { ok: false, error: "Ingresso não encontrado." };

  const { data: event, error: eErr } = await admin
    .from("events")
    .select(
      "id, status, service_fee_percent, service_fee_flat_cents, max_tickets_per_purchase, title, starts_at, venue_name, venue_address"
    )
    .eq("id", tt.event_id)
    .maybeSingle();
  if (eErr) return { ok: false, error: eErr.message };
  if (!event || event.status !== "published") {
    return { ok: false, error: "Este evento não está mais disponível." };
  }

  // 2. Validate quantity
  if (parsed.data.quantity > event.max_tickets_per_purchase) {
    return {
      ok: false,
      error: `Máximo ${event.max_tickets_per_purchase} ingressos por compra.`,
    };
  }
  const now = new Date();
  if (tt.sales_start_at && new Date(tt.sales_start_at) > now) {
    return { ok: false, error: "As vendas ainda não começaram." };
  }
  if (tt.sales_end_at && new Date(tt.sales_end_at) < now) {
    return { ok: false, error: "As vendas deste ingresso já encerraram." };
  }
  const remaining = tt.quantity_total - tt.quantity_sold;
  if (remaining < parsed.data.quantity) {
    return {
      ok: false,
      error:
        remaining === 0
          ? "Esgotado."
          : `Restam apenas ${remaining} ingresso(s) deste tipo.`,
    };
  }

  // 3. Compute totals
  const qty = parsed.data.quantity;
  const subtotal = tt.price_cents * qty;
  const fees =
    Math.round((subtotal * event.service_fee_percent) / 100) +
    event.service_fee_flat_cents * qty;
  const total = subtotal + fees;

  // 4. Insert order (status=paid in demo mode)
  const buyerCpf = parsed.data.buyer_cpf.replace(/\D/g, "");
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      event_id: event.id,
      buyer_name: parsed.data.buyer_name,
      buyer_email: parsed.data.buyer_email.toLowerCase(),
      buyer_cpf: buyerCpf,
      buyer_phone: parsed.data.buyer_phone || null,
      subtotal_cents: subtotal,
      fees_cents: fees,
      total_cents: total,
      status: "paid",
      payment_method: "pix",
      paid_at: now.toISOString(),
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    return { ok: false, error: orderErr?.message ?? "Falha ao registrar pedido." };
  }

  // 5. Insert order_items
  await admin.from("order_items").insert({
    order_id: order.id,
    ticket_type_id: tt.id,
    quantity: qty,
    unit_price_cents: tt.price_cents,
    attendees: Array.from({ length: qty }, () => ({
      name: parsed.data.buyer_name,
      cpf: buyerCpf,
    })),
  });

  // 6. Insert tickets (one per quantity, fresh qr_token each)
  const tickets = Array.from({ length: qty }, () => ({
    order_id: order.id,
    ticket_type_id: tt.id,
    event_id: event.id,
    holder_name: parsed.data.buyer_name,
    holder_cpf: buyerCpf,
    status: "valid",
  }));
  const { data: insertedTickets } = await admin
    .from("tickets")
    .insert(tickets)
    .select("id, qr_token");

  // 7. Bump quantity_sold (read-then-update; for prod a stored procedure with
  // SELECT ... FOR UPDATE would be safer against races)
  await admin
    .from("ticket_types")
    .update({ quantity_sold: tt.quantity_sold + qty })
    .eq("id", tt.id);

  // 8. Fire-and-(mostly)-forget: deliver one e-mail per ticket. Failure here
  // never blocks the redirect — the user still has their tickets on /pedido.
  if (process.env.RESEND_API_KEY) {
    const issued = (insertedTickets ?? []) as Array<{
      id: string;
      qr_token: string;
    }>;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const ticketUrl = `${appUrl}/pedido/${order.id}`;
    const eventStartsAt = dateShort(event.starts_at);

    // Run in parallel; swallow individual failures so one bounced mail
    // doesn't break the order.
    await Promise.allSettled(
      issued.map((t) =>
        sendTicketEmail({
          to: parsed.data.buyer_email,
          qrToken: t.qr_token,
          holderName: parsed.data.buyer_name,
          eventTitle: event.title,
          eventStartsAt,
          venueName: event.venue_name,
          venueAddress: event.venue_address,
          ticketTypeName: tt.name,
          ticketUrl,
          orderId: order.id,
        }).catch((err) => {
          console.error("[checkout] e-mail send failed", err);
        })
      )
    );
  }

  redirect(`/pedido/${order.id}`);
}
