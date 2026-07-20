"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  /** Only set once the user has a claimed username — omitted on the claim-username screen. */
  liveUrl?: string;
}

const EXPLORE_ITEMS = ["Founders", "Stacks", "Tools", "Collections"];
const SHELF_ITEMS = ["Books", "Apps", "Podcasts", "Playlists", "Gear", "Places"];

/**
 * Persistent left rail for the dashboard. Nav has "Home" plus hardcoded,
 * inert Explore/Shelf sections (placeholder-only — see NavSection below);
 * the theme toggle and account utility links (live-shelf link, log out)
 * are pinned to the bottom of the column via `mt-auto` on their own
 * block, separated from the nav by a divider.
 */
export function Sidebar({ liveUrl }: SidebarProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col border-r border-line bg-bg px-4 py-6">
      <div>
        <Link href="/" className="mb-6 flex items-center gap-[10px] px-2">
          <Logo className="h-[26px] w-[26px]" />
          <span className="text-[18px] font-bold tracking-[-0.02em] text-fg">
            liyo
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          <span className="flex items-center gap-2 rounded-[9px] bg-surface-2 px-3 py-2 text-[14px] font-medium text-fg">
            Home
          </span>
        </nav>

        {/* Hardcoded, inert placeholders matching the mockup — not wired to
            real routes or data, pending a decision on whether to build
            these out. */}
        <NavSection label="Explore" items={EXPLORE_ITEMS} />
        <NavSection label="Shelf" items={SHELF_ITEMS} />
      </div>

      <div className="mt-auto flex flex-col gap-[10px]">
        <ThemeToggle />
        <div className="flex flex-col gap-2 border-t border-line px-2 pt-[10px] text-[12.5px]">
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">View your live shelf &rarr;</a>
          )}
          <button type="button" onClick={signOut} className="text-left text-muted hover:text-fg">
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <span className="mb-1.5 ml-[10px] mt-[18px] block text-[10px] tracking-[0.06em] text-muted-2">
        {label}
      </span>
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="mb-0.5 block rounded-[8px] px-[10px] py-[7px] text-[13px] text-muted hover:bg-surface-2 hover:text-fg"
        >
          {item}
        </a>
      ))}
    </div>
  );
}
