import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request. Does two jobs:
 *
 * 1. Keeps the Supabase login session alive (refreshes it via cookies).
 * 2. Routes by subdomain — shelf.liyo.dev quietly serves everything
 *    from a /dashboard folder, while liyo.dev serves the marketing
 *    site and public /[username] shelves. The visitor never sees
 *    "/dashboard" in the URL; it's an internal rewrite.
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const isDashboard = hostname.startsWith("shelf.");

  const url = request.nextUrl.clone();
  if (isDashboard && !url.pathname.startsWith("/dashboard")) {
    url.pathname = `/dashboard${url.pathname}`;
  }

  let response = NextResponse.rewrite(url, {
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.rewrite(url, {
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.rewrite(url, {
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
