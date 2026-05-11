import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserRole = "super_admin" | "event_maker" | "client_user";

export type Profile = {
  id: string;
  role: UserRole;
  name: string | null;
  full_name: string | null;
  document_type: "cpf" | "cnpj" | "passport" | null;
  document_number: string | null;
  date_of_birth: string | null;
  phone: string | null;
  phone_verified_at: string | null;
  terms_accepted_at: string | null;
};

export function isProfileComplete(p: Profile): boolean {
  return Boolean(
    p.full_name &&
      p.document_type &&
      p.document_number &&
      p.date_of_birth &&
      p.phone &&
      p.phone_verified_at &&
      p.terms_accepted_at
  );
}

export type CurrentUser = {
  id: string;
  email: string;
  profile: Profile;
};

/**
 * Loads the auth user and their profile. Redirects unauthenticated users.
 * If a profile row is missing (e.g. user created before the trigger existed),
 * a default `event_maker` profile is inserted via service role and returned.
 */
export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const COLUMNS =
    "id, role, name, full_name, document_type, document_number, date_of_birth, phone, phone_verified_at, terms_accepted_at";

  const { data: existing } = await supabase
    .from("profiles")
    .select(COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: user.id,
      email: user.email ?? "",
      profile: existing as Profile,
    };
  }

  const admin = createAdminClient();
  const fallbackName =
    user.user_metadata?.name ?? user.email?.split("@")[0] ?? null;
  const { data: created, error } = await admin
    .from("profiles")
    .insert({ id: user.id, role: "event_maker", name: fallbackName })
    .select(COLUMNS)
    .single();
  if (error) throw error;

  return {
    id: user.id,
    email: user.email ?? "",
    profile: created as Profile,
  };
}

export async function requireRole(allowed: UserRole[]): Promise<CurrentUser> {
  const me = await requireUser();
  if (!allowed.includes(me.profile.role)) {
    redirect(homeForRole(me.profile.role));
  }
  return me;
}

/**
 * Where each role lands by default. Used by /dashboard layout to bounce users
 * who shouldn't be there, and by /login after sign-in.
 */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "event_maker":
      return "/dashboard";
    case "client_user":
      return "/minha-conta";
  }
}
