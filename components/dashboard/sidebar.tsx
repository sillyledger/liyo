import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * Persistent left rail for the dashboard. Only "Home" exists for now —
 * built so future sections (Explore, Shelf categories) just append
 * more nav groups below, matching the original mockup's structure.
 */
export function Sidebar() {
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
    </aside>
  );
}
