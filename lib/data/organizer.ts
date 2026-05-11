import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, type CurrentUser } from "@/lib/data/user";

export type Organizer = {
  id: string;
  user_id: string;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  municipal_registration: string | null;
  tax_regime: "simples_nacional" | "lucro_presumido" | "mei" | null;
  digital_cert_uploaded_at: string | null;
};

/**
 * Returns the auth user + their organizer row. Only event_maker and
 * super_admin reach this — client_user is bounced to /minha-conta. If the
 * user has no organizer yet, one is auto-created (event_maker only).
 */
export async function requireOrganizer(): Promise<{
  user: CurrentUser;
  organizer: Organizer;
}> {
  const me = await requireUser();
  if (me.profile.role === "client_user") {
    redirect("/minha-conta");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("organizers")
    .select("*")
    .eq("user_id", me.id)
    .maybeSingle();

  if (existing) return { user: me, organizer: existing as Organizer };

  // super_admin without an organizer goes to the platform dashboard
  if (me.profile.role === "super_admin") {
    redirect("/admin");
  }

  // event_maker: auto-create stub organizer
  const admin = createAdminClient();
  const fallbackName =
    me.profile.name ?? me.email.split("@")[0] ?? "Minha empresa";
  const { data: created, error } = await admin
    .from("organizers")
    .insert({ user_id: me.id, name: fallbackName })
    .select("*")
    .single();
  if (error) throw error;

  return { user: me, organizer: created as Organizer };
}
