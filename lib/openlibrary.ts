/** Open Library asks integrations to identify themselves on regular-use requests. */
const OPEN_LIBRARY_USER_AGENT = "Liyo (liyo.dev)";

export function openLibraryCoverUrl(coverId: number): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

/**
 * Looks up a book cover via Open Library's search API using title + optional
 * author — no ISBN required from the user. Returns null if no matching
 * edition has a cover, so callers can fall back to a placeholder.
 */
export async function findBookCoverUrl(title: string, author: string): Promise<string | null> {
  if (!title.trim()) return null;

  const params = new URLSearchParams({ title: title.trim(), limit: "1", fields: "cover_i" });
  if (author.trim()) params.set("author", author.trim());

  const url = `https://openlibrary.org/search.json?${params}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": OPEN_LIBRARY_USER_AGENT },
    });

    if (!response.ok) {
      console.error(`Open Library search failed (${response.status} ${response.statusText}): ${url}`);
      return null;
    }

    const data = await response.json();
    const coverId = data?.docs?.[0]?.cover_i;

    if (typeof coverId !== "number") {
      console.error(`Open Library search had no cover match: ${url}`, data);
      return null;
    }

    return openLibraryCoverUrl(coverId);
  } catch (err) {
    console.error(`Open Library search threw: ${url}`, err);
    return null;
  }
}
