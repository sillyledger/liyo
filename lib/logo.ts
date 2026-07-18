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

/** Clearbit's public logo API — no API key required. Callers must still handle a 404/failed load. */
export function clearbitLogoUrl(url: string | null | undefined): string | null {
  const domain = domainFromUrl(url);
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}
