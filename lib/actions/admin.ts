"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/data/user";

const roleSchema = z.enum(["super_admin", "event_maker", "client_user"]);

export async function setUserRole(formData: FormData): Promise<void> {
  await requireRole(["super_admin"]);
  const userId = (formData.get("user_id") as string | null)?.trim();
  const role = roleSchema.parse(formData.get("role"));
  if (!userId) throw new Error("user_id ausente");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}
