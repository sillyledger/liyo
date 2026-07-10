/**
 * The signature element: a literal shelf holding "collectible" tiles.
 * Each tile represents one section of a Liyo profile.
 * Pure presentational / server component — animations are CSS only.
 */

const TAG =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-muted";
const TILE =
  "animate-settle relative flex flex-col gap-[10px] rounded-[14px] border border-line bg-ink-3 p-[14px] opacity-0 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.8)]";
const GLYPH =
  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]";

export function Shelf() {
  return (
    <div className="flex flex-col [perspective:1200px]" aria-hidden="true">
      {/* ---- shelf one ---- */}
      <div className="mb-[34px]">
        <div className="relative z-[2] flex flex-wrap items-end gap-4 px-[6px]">
          {/* reading */}
          <div className={`${TILE} w-[118px]`} style={{ animationDelay: "0.15s" }}>
            <div className="flex h-[74px] flex-col justify-end gap-1 rounded-lg bg-gradient-to-br from-amber to-[#C98A3C] p-[9px] shadow-[inset_6px_0_0_rgba(30,20,8,0.18)]">
              <span className="block h-[3px] w-[70%] rounded-sm bg-[rgba(30,20,8,0.55)]" />
              <span className="block h-[3px] w-[45%] rounded-sm bg-[rgba(30,20,8,0.55)]" />
            </div>
            <span className={TAG}>Reading</span>
          </div>

          {/* stack */}
          <div className={`${TILE} w-[132px]`} style={{ animationDelay: "0.27s" }}>
            <div className={`${GLYPH} border border-line bg-[#12100A]`}>
              <span className="font-mono text-[15px] text-leaf">&gt;_</span>
            </div>
            <span className={TAG}>Stack</span>
            <div className="flex flex-wrap gap-[6px]">
              {["Next.js", "Supabase"].map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-line bg-[#12100A] px-[7px] py-[3px] font-mono text-[10px] text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* desk */}
          <div className={`${TILE} w-[104px]`} style={{ animationDelay: "0.39s" }}>
            <div className={`${GLYPH} border border-line bg-[#12100A]`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="#E8B45A" strokeWidth="1.6" />
                <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="#E8B45A" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className={TAG}>Desk</span>
          </div>
        </div>
        <div className="shelf-ledge" />
      </div>

      {/* ---- shelf two ---- */}
      <div>
        <div className="relative z-[2] flex flex-wrap items-end gap-4 px-[6px]">
          {/* playlist */}
          <div className={`${TILE} w-[186px]`} style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-[11px]">
              <div className={`${GLYPH} bg-gradient-to-br from-leaf to-leaf-deep`}>
                <div className="flex h-[18px] items-end gap-[3px]">
                  {[40, 90, 55, 100, 65].map((h, i) => (
                    <i
                      key={i}
                      className="animate-eq w-[3px] rounded-sm bg-[#0F1509]"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-paper">Deep focus</span>
                <span className="text-[11.5px] text-muted">57 tracks · coding mix</span>
              </div>
            </div>
            <span className={TAG}>Playlist</span>
          </div>

          {/* building */}
          <div className={`${TILE} w-[170px]`} style={{ animationDelay: "0.62s" }}>
            <div className="flex items-center gap-[11px]">
              <div className={`${GLYPH} bg-gradient-to-br from-amber to-[#B87A2E]`}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7l8-4 8 4-8 4-8-4Z" stroke="#0F1509" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M4 7v6l8 4 8-4V7" stroke="#0F1509" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-[7px] text-[14px] font-medium text-paper">
                  <span className="h-[6px] w-[6px] rounded-full bg-leaf shadow-[0_0_0_3px_rgba(94,201,122,0.22)]" />
                  Building
                </span>
                <span className="text-[11.5px] text-muted">Sorano · Echo Room</span>
              </div>
            </div>
            <span className={TAG}>Projects</span>
          </div>
        </div>
        <div className="shelf-ledge" />
      </div>
    </div>
  );
}