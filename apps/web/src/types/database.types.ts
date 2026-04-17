/**
 * Supabase generated types — placeholder.
 *
 * To regenerate from the live schema (project ref `oapdfhivzojyahvphebs`):
 *
 *   pnpm typegen
 *
 * which runs:
 *
 *   supabase gen types typescript --project-id oapdfhivzojyahvphebs --schema public \
 *     > apps/web/src/types/database.types.ts
 *
 * Until Story 1.2 wires real auth + queries, an empty Database stub is enough
 * to satisfy `@supabase/ssr` generic constraints. Do NOT hand-edit beyond this
 * scaffold — `pnpm typegen` will overwrite the file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
