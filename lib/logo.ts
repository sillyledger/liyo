/** Extracts a bare domain (no protocol, no "www.") from whatever the user typed. */
export function domainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const hostname = new URL(withProtocol).hostname.replace(/^www\./i, "");
    return hostname || null;
  } catch {
    return null;
  }
}

/**
 * Google's public favicon service — no API key required. (Clearbit's logo API,
 * used here previously, was shut down permanently on 2025-12-08.) Callers
 * must still handle a failed/empty load.
 */
export function googleFaviconUrl(url: string | null | undefined): string | null {
  const domain = domainFromUrl(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
}
