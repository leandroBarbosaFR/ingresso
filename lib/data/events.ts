import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type EventStatus = "draft" | "published" | "cancelled" | "finished";

export type EventRow = {
  id: string;
  organizer_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
  service_fee_percent: number;
  service_fee_flat_cents: number;
  max_tickets_per_purchase: number;
};

export type TicketTypeRow = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity_total: number;
  quantity_sold: number;
  sales_start_at: string | null;
  sales_end_at: string | null;
  position: number;
};

export async function listEventsForOrganizer(organizerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export type EventWithStats = EventRow & {
  sold: number;
  total: number;
  revenueCents: number;
};

export async function listEventsWithStats(
  organizerId: string
): Promise<EventWithStats[]> {
  const events = await listEventsForOrganizer(organizerId);
  if (events.length === 0) return [];
  const ids = events.map((e) => e.id);

  const admin = createAdminClient();
  const [{ data: tts }, { data: paid }] = await Promise.all([
    admin
      .from("ticket_types")
      .select("event_id, quantity_total, quantity_sold")
      .in("event_id", ids),
    admin
      .from("orders")
      .select("event_id, total_cents")
      .in("event_id", ids)
      .eq("status", "paid"),
  ]);

  const sold = new Map<string, number>();
  const total = new Map<string, number>();
  (tts ?? []).forEach(
    (t: { event_id: string; quantity_total: number; quantity_sold: number }) => {
      sold.set(t.event_id, (sold.get(t.event_id) ?? 0) + t.quantity_sold);
      total.set(t.event_id, (total.get(t.event_id) ?? 0) + t.quantity_total);
    }
  );
  const revenue = new Map<string, number>();
  (paid ?? []).forEach((o: { event_id: string; total_cents: number }) => {
    revenue.set(o.event_id, (revenue.get(o.event_id) ?? 0) + o.total_cents);
  });

  return events.map((e) => ({
    ...e,
    sold: sold.get(e.id) ?? 0,
    total: total.get(e.id) ?? 0,
    revenueCents: revenue.get(e.id) ?? 0,
  }));
}

export async function getEventForOrganizer(eventId: string, organizerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", organizerId)
    .maybeSingle();
  if (error) throw error;
  return (data as EventRow) ?? null;
}

export async function listTicketTypes(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TicketTypeRow[];
}

/**
 * Aggregates used by the overview / per-event dashboard cards. Service-role
 * because we count across organizer-owned events without per-row RLS reads.
 */
export async function organizerStats(organizerId: string) {
  const admin = createAdminClient();

  const { data: events } = await admin
    .from("events")
    .select("id, status")
    .eq("organizer_id", organizerId);
  const eventIds = (events ?? []).map((e: { id: string }) => e.id);
  const activeEvents = (events ?? []).filter(
    (e: { status: string }) => e.status === "published"
  ).length;

  if (eventIds.length === 0) {
    return {
      activeEvents: 0,
      ticketsSold: 0,
      revenueCents: 0,
      checkInRate: 0,
    };
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: paid } = await admin
    .from("orders")
    .select("total_cents, paid_at, id")
    .in("event_id", eventIds)
    .eq("status", "paid")
    .gte("paid_at", since);
  const revenueCents = (paid ?? []).reduce(
    (sum: number, o: { total_cents: number }) => sum + o.total_cents,
    0
  );

  const { count: ticketsSold } = await admin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .in("event_id", eventIds)
    .neq("status", "cancelled");

  const { count: ticketsValid } = await admin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .in("event_id", eventIds)
    .eq("status", "valid");
  const { count: ticketsUsed } = await admin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .in("event_id", eventIds)
    .eq("status", "used");
  const totalScannable = (ticketsValid ?? 0) + (ticketsUsed ?? 0);
  const checkInRate =
    totalScannable === 0 ? 0 : Math.round(((ticketsUsed ?? 0) / totalScannable) * 100);

  return {
    activeEvents,
    ticketsSold: ticketsSold ?? 0,
    revenueCents,
    checkInRate,
  };
}

export async function upcomingEvents(organizerId: string, limit = 5) {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from("events")
    .select("id, title, starts_at, status")
    .eq("organizer_id", organizerId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (!events?.length) return [];

  const ids = events.map((e: { id: string }) => e.id);
  const { data: tts } = await admin
    .from("ticket_types")
    .select("event_id, quantity_total, quantity_sold")
    .in("event_id", ids);

  const totals = new Map<string, { sold: number; total: number }>();
  (tts ?? []).forEach(
    (t: { event_id: string; quantity_total: number; quantity_sold: number }) => {
      const cur = totals.get(t.event_id) ?? { sold: 0, total: 0 };
      cur.sold += t.quantity_sold;
      cur.total += t.quantity_total;
      totals.set(t.event_id, cur);
    }
  );

  return events.map(
    (e: { id: string; title: string; starts_at: string; status: string }) => ({
      ...e,
      sold: totals.get(e.id)?.sold ?? 0,
      total: totals.get(e.id)?.total ?? 0,
    })
  );
}
