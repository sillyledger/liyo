"use client";

import { useState } from "react";
import { clearbitLogoUrl } from "@/lib/logo";

interface ItemLogoProps {
  name: string;
  url?: string | null;
  className?: string;
}

/**
 * Auto-fetched logo via Clearbit's public logo API, falling back to a
 * monogram (same visual pattern as the avatar fallback) when there's no
 * URL to derive a domain from, or the logo fails to load (e.g. a 404).
 */
export function ItemLogo({ name, url, className = "h-9 w-9" }: ItemLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = clearbitLogoUrl(url);
  const initial = (name || "?").charAt(0).toUpperCase();

  if (!logoUrl || failed) {
    return (
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-[8px] border border-line-2 bg-gradient-to-br from-surface-2 to-bg font-mono text-[12px] text-muted ${className}`}
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      onError={() => setFailed(true)}
      className={`flex-shrink-0 rounded-[8px] border border-line-2 bg-surface object-contain p-1.5 ${className}`}
    />
  );
}
