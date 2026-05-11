/**
 * Loose placeholder for the generated Supabase database types.
 *
 * Replace with the output of:
 *   pnpm dlx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 *
 * The shape below is permissive enough to let `from(any).insert(any)`,
 * `.update(any)`, and `.select(...)` compile without locking us into a
 * stale schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = { [key: string]: any };

type Table = {
  Row: Row;
  Insert: Row;
  Update: Row;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: Record<string, Table>;
    Views: Record<string, Pick<Table, "Row" | "Relationships">>;
    Functions: Record<
      string,
      { Args: Record<string, unknown>; Returns: unknown }
    >;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
};
