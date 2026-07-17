import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the server — inside Server Components,
 * Route Handlers, and Server Actions. Reads and writes the login
 * session via cookies, so pages know who's logged in before anything
 * renders (important for the dashboard on shelf.liyo.dev, and for
 * checking "is this my own shelf?" on the public profile pages).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore since
            // middleware handles refreshing the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}
