import { createAdminClient } from "@/lib/supabase/admin";

export type PlatformStats = {
  organizers: number;
  publishedEvents: number;
  draftEvents: number;
  ticketsSold: number;
  grossRevenueCents: number;
};

export async function platformStats(): Promise<PlatformStats> {
  const admin = createAdminClient();
  const [
    { count: organizers },
    { count: publishedEvents },
    { count: draftEvents },
    { count: ticketsSold },
    { data: paid },
  ] = await Promise.all([
    admin.from("organizers").select("id", { count: "exact", head: true }),
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    admin
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .neq("status", "cancelled"),
    admin.from("orders").select("total_cents").eq("status", "paid"),
  ]);

  const grossRevenueCents = (paid ?? []).reduce(
    (sum: number, o: { total_cents: number }) => sum + o.total_cents,
    0
  );

  return {
    organizers: organizers ?? 0,
    publishedEvents: publishedEvents ?? 0,
    draftEvents: draftEvents ?? 0,
    ticketsSold: ticketsSold ?? 0,
    grossRevenueCents,
  };
}

export async function listAllOrganizers() {
  const admin = createAdminClient();
  const { data: organizers, error } = await admin
    .from("organizers")
    .select("id, user_id, name, legal_name, cnpj, tax_regime, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  // join emails from auth.users via admin API
  const ids = (organizers ?? []).map((o: { user_id: string }) => o.user_id);
  const emails = new Map<string, string>();
  if (ids.length > 0) {
    // listUsers paginates; fetch first page (good enough for early-stage SaaS)
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    users.users.forEach((u) => {
      if (u.email) emails.set(u.id, u.email);
    });
  }

  return (organizers ?? []).map(
    (o: {
      id: string;
      user_id: string;
      name: string;
      legal_name: string | null;
      cnpj: string | null;
      tax_regime: string | null;
      created_at: string;
    }) => ({
      ...o,
      email: emails.get(o.user_id) ?? null,
    })
  );
}

export async function listAllEvents() {
  const admin = createAdminClient();
  const { data: events, error } = await admin
    .from("events")
    .select(
      "id, title, slug, status, organizer_id, venue_city, venue_state, starts_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const orgIds = [
    ...new Set((events ?? []).map((e: { organizer_id: string }) => e.organizer_id)),
  ];
  const { data: organizers } = orgIds.length
    ? await admin.from("organizers").select("id, name").in("id", orgIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const orgNames = new Map(
    (organizers ?? []).map((o: { id: string; name: string }) => [o.id, o.name])
  );

  return (events ?? []).map(
    (e: {
      id: string;
      title: string;
      slug: string;
      status: string;
      organizer_id: string;
      venue_city: string;
      venue_state: string;
      starts_at: string;
      created_at: string;
    }) => ({ ...e, organizer_name: orgNames.get(e.organizer_id) ?? "—" })
  );
}

export async function listAllUsers() {
  const admin = createAdminClient();
  const [{ data: profiles }, { data: usersData }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, role, name, created_at")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emails = new Map<string, string>();
  usersData.users.forEach((u) => {
    if (u.email) emails.set(u.id, u.email);
  });
  return (profiles ?? []).map(
    (p: {
      id: string;
      role: string;
      name: string | null;
      created_at: string;
    }) => ({ ...p, email: emails.get(p.id) ?? null })
  );
}
