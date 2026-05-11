import { createAdminClient } from "@/lib/supabase/admin";

export type DailyPoint = { date: string; value: number };

export type AdminAnalytics = {
  totals: {
    grossRevenueCents: number;
    feesCents: number;
    netRevenueCents: number;
    paidOrders: number;
    ticketsSold: number;
    avgOrderCents: number;
    refundedCount: number;
    refundedCents: number;
  };
  growth: {
    newUsers7d: number;
    newUsers30d: number;
    newOrganizers30d: number;
    newEvents30d: number;
  };
  events: {
    total: number;
    published: number;
    draft: number;
    cancelled: number;
    finished: number;
  };
  dailyRevenue: DailyPoint[]; // last 30 days, in cents
  dailyOrders: DailyPoint[]; // last 30 days
  revenueByCategory: { slug: string; revenueCents: number; orders: number }[];
  paymentMix: { method: string; orders: number; revenueCents: number }[];
  topOrganizers: {
    id: string;
    name: string;
    revenueCents: number;
    eventCount: number;
  }[];
  topEvents: {
    id: string;
    title: string;
    slug: string;
    sold: number;
    total: number;
    revenueCents: number;
  }[];
};

const MS_DAY = 24 * 60 * 60 * 1000;

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function adminAnalytics(): Promise<AdminAnalytics> {
  const admin = createAdminClient();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * MS_DAY).toISOString();
  const since7 = new Date(now.getTime() - 7 * MS_DAY).toISOString();

  const [
    { data: paidOrders },
    { data: refundedOrders },
    { data: events },
    { data: organizers },
    { data: profiles },
    { data: ticketTypes },
    { data: tickets },
  ] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id, event_id, total_cents, subtotal_cents, fees_cents, paid_at, payment_method"
      )
      .eq("status", "paid"),
    admin
      .from("orders")
      .select("id, total_cents")
      .eq("status", "refunded"),
    admin
      .from("events")
      .select("id, title, slug, status, organizer_id, category, created_at"),
    admin.from("organizers").select("id, name, created_at"),
    admin.from("profiles").select("id, created_at"),
    admin
      .from("ticket_types")
      .select("event_id, quantity_sold, quantity_total"),
    admin
      .from("tickets")
      .select("id, status, event_id", { count: "exact" }),
  ]);

  const evList = (events ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    organizer_id: string;
    category: string | null;
    created_at: string;
  }>;
  const orgList = (organizers ?? []) as Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  const profList = (profiles ?? []) as Array<{ id: string; created_at: string }>;
  const paid = (paidOrders ?? []) as Array<{
    id: string;
    event_id: string;
    total_cents: number;
    subtotal_cents: number;
    fees_cents: number;
    paid_at: string | null;
    payment_method: string | null;
  }>;
  const refunded = (refundedOrders ?? []) as Array<{
    id: string;
    total_cents: number;
  }>;
  const tts = (ticketTypes ?? []) as Array<{
    event_id: string;
    quantity_sold: number;
    quantity_total: number;
  }>;
  const tk = (tickets ?? []) as Array<{ id: string; event_id: string; status: string }>;

  // ── totals ───────────────────────────────────────────────────────────────
  const grossRevenueCents = paid.reduce((s, o) => s + o.total_cents, 0);
  const feesCents = paid.reduce((s, o) => s + o.fees_cents, 0);
  const netRevenueCents = grossRevenueCents - feesCents;
  const refundedCount = refunded.length;
  const refundedCents = refunded.reduce((s, o) => s + o.total_cents, 0);
  const ticketsSold = tk.filter((t) => t.status !== "cancelled").length;
  const avgOrderCents =
    paid.length === 0 ? 0 : Math.round(grossRevenueCents / paid.length);

  // ── growth ───────────────────────────────────────────────────────────────
  const newUsers7d = profList.filter((p) => p.created_at >= since7).length;
  const newUsers30d = profList.filter((p) => p.created_at >= since30).length;
  const newOrganizers30d = orgList.filter(
    (o) => o.created_at >= since30
  ).length;
  const newEvents30d = evList.filter((e) => e.created_at >= since30).length;

  // ── events breakdown ─────────────────────────────────────────────────────
  const eventsBreakdown = {
    total: evList.length,
    published: evList.filter((e) => e.status === "published").length,
    draft: evList.filter((e) => e.status === "draft").length,
    cancelled: evList.filter((e) => e.status === "cancelled").length,
    finished: evList.filter((e) => e.status === "finished").length,
  };

  // ── daily series (last 30 days) ──────────────────────────────────────────
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(isoDay(new Date(now.getTime() - i * MS_DAY)));
  }
  const revenueByDay = new Map<string, number>(
    days.map((d) => [d, 0] as [string, number])
  );
  const ordersByDay = new Map<string, number>(
    days.map((d) => [d, 0] as [string, number])
  );
  paid.forEach((o) => {
    if (!o.paid_at) return;
    const day = o.paid_at.slice(0, 10);
    if (revenueByDay.has(day)) {
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + o.total_cents);
      ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    }
  });
  const dailyRevenue: DailyPoint[] = days.map((d) => ({
    date: d,
    value: revenueByDay.get(d) ?? 0,
  }));
  const dailyOrders: DailyPoint[] = days.map((d) => ({
    date: d,
    value: ordersByDay.get(d) ?? 0,
  }));

  // ── revenue by category ──────────────────────────────────────────────────
  const eventCat = new Map(evList.map((e) => [e.id, e.category]));
  const byCat = new Map<string, { revenueCents: number; orders: number }>();
  paid.forEach((o) => {
    const slug = eventCat.get(o.event_id) ?? "sem-categoria";
    const cur = byCat.get(slug) ?? { revenueCents: 0, orders: 0 };
    cur.revenueCents += o.total_cents;
    cur.orders += 1;
    byCat.set(slug, cur);
  });
  const revenueByCategory = [...byCat.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  // ── payment mix ──────────────────────────────────────────────────────────
  const byMethod = new Map<string, { orders: number; revenueCents: number }>();
  paid.forEach((o) => {
    const m = o.payment_method ?? "outros";
    const cur = byMethod.get(m) ?? { orders: 0, revenueCents: 0 };
    cur.orders += 1;
    cur.revenueCents += o.total_cents;
    byMethod.set(m, cur);
  });
  const paymentMix = [...byMethod.entries()]
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  // ── top organizers ───────────────────────────────────────────────────────
  const eventToOrg = new Map(evList.map((e) => [e.id, e.organizer_id]));
  const orgRevenue = new Map<string, number>();
  paid.forEach((o) => {
    const orgId = eventToOrg.get(o.event_id);
    if (!orgId) return;
    orgRevenue.set(orgId, (orgRevenue.get(orgId) ?? 0) + o.total_cents);
  });
  const orgEventCount = new Map<string, number>();
  evList.forEach((e) =>
    orgEventCount.set(e.organizer_id, (orgEventCount.get(e.organizer_id) ?? 0) + 1)
  );
  const topOrganizers = orgList
    .map((o) => ({
      id: o.id,
      name: o.name,
      revenueCents: orgRevenue.get(o.id) ?? 0,
      eventCount: orgEventCount.get(o.id) ?? 0,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);

  // ── top events ───────────────────────────────────────────────────────────
  const evSold = new Map<string, { sold: number; total: number }>();
  tts.forEach((t) => {
    const cur = evSold.get(t.event_id) ?? { sold: 0, total: 0 };
    cur.sold += t.quantity_sold;
    cur.total += t.quantity_total;
    evSold.set(t.event_id, cur);
  });
  const evRevenue = new Map<string, number>();
  paid.forEach((o) =>
    evRevenue.set(o.event_id, (evRevenue.get(o.event_id) ?? 0) + o.total_cents)
  );
  const topEvents = evList
    .map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      sold: evSold.get(e.id)?.sold ?? 0,
      total: evSold.get(e.id)?.total ?? 0,
      revenueCents: evRevenue.get(e.id) ?? 0,
    }))
    .sort((a, b) => b.sold - a.sold || b.revenueCents - a.revenueCents)
    .slice(0, 5);

  return {
    totals: {
      grossRevenueCents,
      feesCents,
      netRevenueCents,
      paidOrders: paid.length,
      ticketsSold,
      avgOrderCents,
      refundedCount,
      refundedCents,
    },
    growth: {
      newUsers7d,
      newUsers30d,
      newOrganizers30d,
      newEvents30d,
    },
    events: eventsBreakdown,
    dailyRevenue,
    dailyOrders,
    revenueByCategory,
    paymentMix,
    topOrganizers,
    topEvents,
  };
}
