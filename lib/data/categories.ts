import { createClient } from "@/lib/supabase/server";

export type Category = {
  slug: string;
  name: string;
  cover_url: string | null;
  position: number;
};

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, cover_url, position")
    .order("position", { ascending: true });
  if (error) {
    // PGRST205 = relation missing. Tolerate it so the app boots before the
    // categories migration has been applied; everything degrades to empty.
    if ((error as { code?: string }).code === "PGRST205") return [];
    throw error;
  }
  return (data ?? []) as Category[];
}

export async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, cover_url, position")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Category) ?? null;
}
