import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, CheckCircle2, Mail, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { brl, dateTime } from "@/lib/format";

export const metadata = {
  title: "Pedido confirmado — Ingressos",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, event_id, buyer_name, buyer_email, total_cents, status, paid_at, payment_method"
    )
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const [{ data: event }, { data: tickets }] = await Promise.all([
    admin
      .from("events")
      .select(
        "id, title, slug, venue_name, venue_city, venue_state, starts_at"
      )
      .eq("id", order.event_id)
      .single(),
    admin
      .from("tickets")
      .select(
        "id, qr_token, holder_name, status, ticket_type_id"
      )
      .eq("order_id", order.id),
  ]);

  const ticketTypeIds = [
    ...new Set(
      (tickets ?? []).map((t: { ticket_type_id: string }) => t.ticket_type_id)
    ),
  ];
  const { data: ticketTypes } = ticketTypeIds.length
    ? await admin
        .from("ticket_types")
        .select("id, name")
        .in("id", ticketTypeIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const typeName = new Map<string, string>(
    (ticketTypes ?? []).map((t: { id: string; name: string }) => [t.id, t.name])
  );

  const ticketList = (tickets ?? []) as Array<{
    id: string;
    qr_token: string;
    holder_name: string;
    status: string;
    ticket_type_id: string;
  }>;

  // Generate QR data URLs server-side (qrcode is already a project dep).
  const qrByToken = new Map<string, string>();
  await Promise.all(
    ticketList.map(async (t) => {
      const dataUrl = await QRCode.toDataURL(t.qr_token, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
      });
      qrByToken.set(t.qr_token, dataUrl);
    })
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="space-y-1">
          <p className="text-base font-semibold">Pedido confirmado!</p>
          <p className="text-sm text-muted-foreground">
            Seus ingressos foram emitidos. Guarde esta página ou apresente o
            QR no acesso.
          </p>
          <p className="inline-flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            Enviamos uma cópia para {order.buyer_email}
          </p>
        </div>
      </div>

      {event ? (
        <section className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Evento
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {event.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dateTime(event.starts_at)} · {event.venue_name} ·{" "}
            {event.venue_city}/{event.venue_state}
          </p>
          <Link
            href={`/e/${event.slug}`}
            className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Página do evento
          </Link>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Seus ingressos ({ticketList.length})
          </h2>
          <Badge variant="default" className="rounded-full">
            <Ticket className="h-3 w-3" /> {order.payment_method ?? "pago"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ticketList.map((t, i) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="shrink-0 rounded-lg bg-white p-2 dark:bg-white/95">
                  {/* QR served as data URL — safe for next/image to skip */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrByToken.get(t.qr_token) ?? ""}
                    alt={`QR ingresso ${i + 1}`}
                    width={96}
                    height={96}
                    className="h-24 w-24"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Ingresso {i + 1} · {typeName.get(t.ticket_type_id) ?? ""}
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {t.holder_name}
                  </p>
                  <p className="font-mono text-[10px] break-all text-muted-foreground">
                    {t.qr_token}
                  </p>
                </div>
              </div>
              <div className="border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                Apresente este QR no acesso. Cópias não são válidas como
                entradas adicionais.
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-1 rounded-xl border border-border p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total pago</span>
          <span className="text-lg font-semibold tabular-nums">
            {brl(order.total_cents)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {order.paid_at ? `Pago em ${dateTime(order.paid_at)}` : null}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/eventos">
          <Button variant="outline">Mais eventos</Button>
        </Link>
      </div>
    </div>
  );
}
