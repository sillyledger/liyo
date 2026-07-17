import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Where the magic-link email sends people back to. Exchanges the
 * one-time code in the URL for a real logged-in session, then sends
 * them into the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
