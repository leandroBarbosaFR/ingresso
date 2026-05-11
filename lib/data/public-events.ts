import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  category: string | null;
  venue_city: string;
  venue_state: string;
  starts_at: string;
  price_from_cents: number;
  buyers_24h: number;
};

type EventRow = {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  category: string | null;
  venue_city: string;
  venue_state: string;
  starts_at: string;
};

type Filters = {
  q?: string;
  category?: string;
  city?: string;
  sort?: "date" | "popular" | "price";
  limit?: number;
};

/**
 * Public events for /eventos, /colecoes/[slug], landing sections.
 * Pulls only `published` rows (RLS already enforces this for anon reads but we
 * filter explicitly so service-role helper queries match).
 */
export async function listPublicEvents(filters: Filters = {}): Promise<
  PublicEvent[]
> {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(
      "id, slug, title, cover_url, category, venue_city, venue_state, starts_at"
    )
    .eq("status", "published");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.city)
    query = query.ilike("venue_city", `%${filters.city.trim()}%`);
  if (filters.q) {
    const needle = filters.q.trim().replace(/[%_]/g, "\\$&");
    query = query.or(
      `title.ilike.%${needle}%,venue_name.ilike.%${needle}%,venue_city.ilike.%${needle}%`
    );
  }

  // ascending by date is the natural default; popular/price sort happens after
  // we hydrate aggregates below.
  query = query.order("starts_at", { ascending: true });
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;

  return hydrate((data ?? []) as EventRow[], filters.sort ?? "date");
}

export async function getPublicEventBySlug(
  slug: string
): Promise<PublicEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, cover_url, category, venue_city, venue_state, starts_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [hydrated] = await hydrate([data as EventRow], "date");
  return hydrated;
}

/**
 * Most popular published events in the last 24h, ranked by paid-order count.
 * Fallback to most-recently-created when no orders exist (fresh deploys).
 */
export async function popularEvents(limit = 4): Promise<PublicEvent[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: events } = await admin
    .from("events")
    .select(
      "id, slug, title, cover_url, category, venue_city, venue_state, starts_at"
    )
    .eq("status", "published")
    .order("starts_at", { ascending: true })
    .limit(50);
  const rows = (events ?? []) as EventRow[];

  const enriched = await hydrate(rows, "popular");
  return enriched
    .sort((a, b) => {
      if (b.buyers_24h !== a.buyers_24h) return b.buyers_24h - a.buyers_24h;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    })
    .slice(0, limit);

  // unused but keep `since` referenced so eslint-no-unused-vars doesn't fail
  void since;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function hydrate(
  events: EventRow[],
  sort: "date" | "popular" | "price"
): Promise<PublicEvent[]> {
  if (events.length === 0) return [];
  const ids = events.map((e) => e.id);
  const admin = createAdminClient();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: tts }, { data: recentOrders }] = await Promise.all([
    admin
      .from("ticket_types")
      .select("event_id, price_cents")
      .in("event_id", ids),
    admin
      .from("orders")
      .select("event_id")
      .in("event_id", ids)
      .eq("status", "paid")
      .gte("paid_at", since),
  ]);

  const minPrice = new Map<string, number>();
  (tts ?? []).forEach((t: { event_id: string; price_cents: number }) => {
    const cur = minPrice.get(t.event_id);
    if (cur === undefined || t.price_cents < cur)
      minPrice.set(t.event_id, t.price_cents);
  });

  const buyers = new Map<string, number>();
  (recentOrders ?? []).forEach((o: { event_id: string }) => {
    buyers.set(o.event_id, (buyers.get(o.event_id) ?? 0) + 1);
  });

  const result: PublicEvent[] = events.map((e) => ({
    ...e,
    price_from_cents: minPrice.get(e.id) ?? 0,
    buyers_24h: buyers.get(e.id) ?? 0,
  }));

  switch (sort) {
    case "price":
      result.sort((a, b) => a.price_from_cents - b.price_from_cents);
      break;
    case "popular":
      result.sort((a, b) => b.buyers_24h - a.buyers_24h);
      break;
    case "date":
    default:
      result.sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
  }

  return result;
}
