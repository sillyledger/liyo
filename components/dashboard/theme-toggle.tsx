"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

/**
 * Explicit light/dark toggle — lives at the bottom of the dashboard
 * sidebar only. The public profile page has no toggle and just follows
 * system preference (see CLAUDE.md's Current build state for why).
 * Starts with neither button highlighted (matches what's server-rendered)
 * and picks up the real state after mount, to avoid a hydration mismatch
 * from reading `document` during the initial render.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function select(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <div className="flex w-fit overflow-hidden rounded-[8px] border border-line-2">
      <button
        type="button"
        onClick={() => select("dark")}
        className={`px-3 py-[5px] text-[11px] ${
          theme === "dark" ? "bg-accent font-medium text-accent-fg" : "text-muted"
        }`}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => select("light")}
        className={`px-3 py-[5px] text-[11px] ${
          theme === "light" ? "bg-accent font-medium text-accent-fg" : "text-muted"
        }`}
      >
        Light
      </button>
    </div>
  );
}
