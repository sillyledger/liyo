import Link from "next/link";
import { Logo } from "./logo";

const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Examples", href: "/examples" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-[clamp(20px,5vw,64px)] py-[22px]">
      <Link href="/" aria-label="Liyo home" className="flex items-center gap-[11px]">
        <Logo />
        <span className="text-[23px] font-bold tracking-[-0.02em] text-paper">
          liyo
        </span>
      </Link>

      <div className="flex items-center gap-[clamp(14px,2.4vw,30px)]">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden text-[14.5px] text-muted transition-colors hover:text-paper md:inline"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/new"
          className="group inline-flex items-center gap-[7px] rounded-[10px] bg-leaf px-4 py-[9px] text-[14.5px] font-semibold text-[#0F1509] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-12px_rgba(94,201,122,0.7)] transition-[transform,background] hover:-translate-y-px hover:bg-leaf-bright"
        >
          Create your shelf
          <span className="transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>
    </nav>
  );
}