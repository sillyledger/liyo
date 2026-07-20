// Open Library cover lookup is temporarily disabled — deferred, not
// abandoned. It wasn't reliably returning covers and isn't worth
// further debugging right now. Currently Reading shows a "Coming soon"
// placeholder instead of a real cover for every book
// (components/currently-reading-card.tsx); title/author still save and
// display normally.
//
// This route (and the onBlur lookup call that used to hit it from
// components/dashboard/edit-currently-reading-modal.tsx) is commented
// out rather than deleted so there's no dead network request to
// openlibrary.org, while keeping the working lookup logic intact for a
// future revival — see lib/openlibrary.ts, which is untouched.
//
// import { NextRequest, NextResponse } from "next/server";
// import { findBookCoverUrl } from "@/lib/openlibrary";
//
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const title = searchParams.get("title") ?? "";
//   const author = searchParams.get("author") ?? "";
//
//   const cover_url = await findBookCoverUrl(title, author);
//   return NextResponse.json({ cover_url });
// }

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ cover_url: null }, { status: 410 });
}
