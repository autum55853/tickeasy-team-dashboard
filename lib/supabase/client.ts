import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}

// Module-level singleton: prevents StrictMode double-subscribe from closing WebSocket.
// removeChannel() on the last channel disconnects the WebSocket; keeping the channel
// alive at module scope avoids the "WebSocket closed before connection established" error.
let _logoutChannel: RealtimeChannel | undefined;

export function ensureLogoutChannel(email: string, onLogout: () => void): void {
  if (_logoutChannel) {
    console.log("[logout-sync] DASH ensureLogoutChannel skip（singleton 已存在）, email =", email);
    return;
  }
  const client = createClient();
  console.log("[logout-sync] DASH subscribe channel:", `tickeasy-session-${email}`);
  const channel = client.channel(`tickeasy-session-${email}`);
  _logoutChannel = channel;
  channel
    .on("broadcast", { event: "LOGOUT" }, (payload: unknown) => {
      console.log("[logout-sync] DASH 收到 LOGOUT broadcast:", payload);
      onLogout();
    })
    .subscribe((status: string) => {
      console.log("[logout-sync] DASH receiver subscribe status =", status);
    });
}
