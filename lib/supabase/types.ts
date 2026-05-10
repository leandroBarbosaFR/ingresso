/**
 * Generated Supabase database types.
 *
 * Replace this placeholder with the output of:
 *   pnpm dlx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 *
 * For now, the loose `Database` type lets the rest of the codebase compile.
 */
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
