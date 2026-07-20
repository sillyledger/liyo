import { NextRequest, NextResponse } from "next/server";
import { findBookCoverUrl } from "@/lib/openlibrary";

/** Proxies the Open Library lookup — the User-Agent header Open Library asks for can't be set from a browser fetch(), so this has to run server-side. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "";
  const author = searchParams.get("author") ?? "";

  const cover_url = await findBookCoverUrl(title, author);
  return NextResponse.json({ cover_url });
}
