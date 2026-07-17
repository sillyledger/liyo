import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the browser — inside Client Components
 * (e.g. the editor on shelf.liyo.dev, once a user is interacting with
 * modals, forms, and buttons).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
