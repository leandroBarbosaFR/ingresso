import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";

import { CheckoutForm } from "@/components/site/checkout-form";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isProfileComplete } from "@/lib/data/user";
import { dateTime } from "@/lib/format";

export const metadata = {
  title: "Checkout — Ingressos",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tt?: string }>;
}) {
  const { tt: ticketTypeId } = await searchParams;
  if (!ticketTypeId) notFound();

  // Auth gate. Guests must sign in (or sign up) and complete their profile
  // before they can pay — Sympla-style flow.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nextUrl = `/checkout?tt=${encodeURIComponent(ticketTypeId)}`;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, name, full_name, document_type, document_number, date_of_birth, phone, phone_verified_at, terms_accepted_at"
    )
    .eq("id", user.id)
    .single();
  if (
    !profile ||
    !isProfileComplete({
      id: profile.id,
      role: profile.role,
      name: profile.name ?? null,
      full_name: profile.full_name ?? null,
      document_type: profile.document_type ?? null,
      document_number: profile.document_number ?? null,
      date_of_birth: profile.date_of_birth ?? null,
      phone: profile.phone ?? null,
      phone_verified_at: profile.phone_verified_at ?? null,
      terms_accepted_at: profile.terms_accepted_at ?? null,
    })
  ) {
    redirect(`/completar-perfil?next=${encodeURIComponent(nextUrl)}`);
  }

  const admin = createAdminClient();
  const { data: tt } = await admin
    .from("ticket_types")
    .select(
      "id, event_id, name, price_cents, quantity_total, quantity_sold, sales_start_at, sales_end_at"
    )
    .eq("id", ticketTypeId)
    .maybeSingle();
  if (!tt) notFound();

  const { data: event } = await admin
    .from("events")
    .select(
      "id, title, slug, status, venue_name, venue_city, venue_state, starts_at, service_fee_percent, service_fee_flat_cents, max_tickets_per_purchase"
    )
    .eq("id", tt.event_id)
    .maybeSingle();
  if (!event || event.status !== "published") notFound();

  const available = tt.quantity_total - tt.quantity_sold;
  const soldOut = available <= 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <Link
        href={`/e/${event.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao evento
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Checkout
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateTime(event.starts_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.venue_name} · {event.venue_city}/{event.venue_state}
          </span>
        </div>
      </div>

      {soldOut ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Este ingresso está esgotado. Volte e escolha outro tipo.
        </div>
      ) : (
        <CheckoutForm
          ticketTypeId={tt.id}
          ticketTypeName={tt.name}
          unitPriceCents={tt.price_cents}
          feePercent={Number(event.service_fee_percent)}
          feeFlatCents={event.service_fee_flat_cents}
          maxPerPurchase={event.max_tickets_per_purchase}
          availableCount={available}
        />
      )}
    </div>
  );
}
