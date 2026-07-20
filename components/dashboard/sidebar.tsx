"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  /** Only set once the user has a claimed username — omitted on the claim-username screen. */
  liveUrl?: string;
}

/**
 * Persistent left rail for the dashboard. Nav sits at the top ("Home"
 * only for now, built to extend with more sections later); the
 * account utility links (live-shelf link, log out) are pinned to the
 * bottom of the column via `mt-auto` on their own block, separated
 * from the nav by a divider.
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

      <div className="mt-auto flex flex-col gap-3 border-t border-line px-2 pt-4 text-[13px]">
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noreferrer" className="text-sea-deep hover:underline">View your live shelf &rarr;</a>
        )}
        <button type="button" onClick={signOut} className="text-left text-muted hover:text-fg">
          Log out
        </button>
      </div>
    </aside>
  );
}
