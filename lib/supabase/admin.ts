import { createClient } from "@supabase/supabase-js";
import WebSocketImpl from "ws";

import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client for server-side jobs that must bypass RLS:
 * Mercado Pago webhook handler, NFS-e issuance, expired-hold cleanup, and
 * admin-only queries (cross-organizer rollups, user listing).
 *
 * NEVER import this from a client component or expose it to the browser.
 *
 * Note: supabase-js's RealtimeClient requires a global WebSocket. Node 20 has
 * none by default, so we provide `ws` as the transport. We never use realtime
 * here, but the constructor still wires one up.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: {
        transport: WebSocketImpl as unknown as typeof WebSocket,
      },
    }
  );
}
