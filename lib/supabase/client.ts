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
  if (_logoutChannel) return;
  const client = createClient();
  _logoutChannel = client.channel(`tickeasy-session-${email}`);
  _logoutChannel.on("broadcast", { event: "LOGOUT" }, onLogout).subscribe();
}
