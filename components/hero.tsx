import Link from "next/link";
import { Shelf } from "./shelf";

export function Hero() {
  return (
    <main className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-[clamp(32px,5vw,80px)] px-[clamp(20px,5vw,64px)] pb-[clamp(48px,6vw,72px)] pt-[clamp(28px,4vw,56px)] md:grid-cols-[1.05fr_0.95fr]">
      {/* copy */}
      <div>
        <span className="mb-[26px] inline-flex items-center gap-[9px] font-mono text-[12px] uppercase tracking-[0.18em] text-leaf">
          <span className="h-[6px] w-[6px] rounded-full bg-leaf shadow-[0_0_0_4px_rgba(94,201,122,0.18)]" />
          Your developer shelf
        </span>

        <h1 className="text-[clamp(2.7rem,6vw,4.6rem)] font-bold leading-[0.97] tracking-[-0.035em] text-paper">
          Show how you build.
          <span className="mt-[0.12em] block text-[0.86em] font-medium tracking-[-0.03em] text-muted">
            Not just <em className="italic text-paper">what</em> you build.
          </span>
        </h1>

        <p className="mt-[26px] max-w-[30em] text-[clamp(1rem,1.15vw,1.12rem)] leading-[1.62] text-muted">
          One shareable page for your{" "}
          <b className="font-medium text-paper">stack, tools, books, desk setup</b>{" "}
          and the things you love. The answer to{" "}
          <b className="font-medium text-paper">&ldquo;what are you using?&rdquo;</b>{" "}
          &mdash; without typing it out every time someone asks.
        </p>

        <div className="mt-[34px] flex flex-wrap items-center gap-3">
          <Link
            href="/new"
            className="group inline-flex items-center gap-[7px] rounded-[12px] bg-leaf px-[22px] py-[13px] text-[15.5px] font-semibold text-[#0F1509] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-12px_rgba(94,201,122,0.7)] transition-[transform,background] hover:-translate-y-px hover:bg-leaf-bright"
          >
            Create your shelf
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
          <Link
            href="/pieter"
            className="inline-flex items-center rounded-[12px] border border-line2 px-[22px] py-[13px] text-[15.5px] font-medium text-paper transition-[transform,border-color] hover:-translate-y-px hover:border-paper"
          >
            See a live shelf
          </Link>
        </div>

        <div className="mt-[26px] flex flex-wrap items-center gap-3 text-[13.5px] text-muted">
          <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink-2 px-[11px] py-[6px] font-mono text-[13px] text-paper">
            liyo.dev/<span className="text-leaf">you</span>
          </span>
          <span>&mdash; drop it in your bio, README, or email signature</span>
        </div>
      </div>

      {/* signature visual */}
      <Shelf />
    </main>
  );
}