# Liyo — Project Context for Claude Code

Read this fully before making changes. It captures architecture decisions,
design rationale, and known gotchas from the project's build history that
aren't otherwise obvious from the code alone.

## What Liyo is

A shareable developer profile platform — "GitHub shows what you build,
Liyo shows how you build." Users get a curated public page
(`liyo.dev/username`) showing their stack, tools, books, desk setup,
playlists, and current projects. Positioned as a "digital shelf" /
shareable vCard, explicitly **not** a social network — designed to be
valuable even at a small user count (avoiding the network-effect trap
that killed comparable products like Read.cv and Polywork).

Part of the Ryoka Group portfolio. No direct monetization — the payoff is
organic social growth and acting as a soft funnel to other Ryoka products
(Sorano, etc.) via the "Building" section on each user's shelf.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind v3
- Supabase: Postgres (with RLS), Auth (magic link), Storage
- Deployed on Vercel

## Domain architecture — important, don't restructure without reason

- **`liyo.dev/[username]`** — public, published shelf. No auth required.
  This is the URL people put in bios/READMEs, so it must stay clean
  (no subdomain).
- **`shelf.liyo.dev`** — private dashboard/editor only. Never shows
  published content directly to the public.
- Both are served by the **same Next.js app / same Vercel project**.
  `middleware.ts` at the repo root inspects the request hostname and
  rewrites `shelf.` traffic into an internal `/dashboard` route group.
  The visitor never sees `/dashboard` in the URL.
- `/auth/*` routes (the magic-link callback) are deliberately **excluded**
  from that rewrite in middleware — a bug earlier had the callback
  getting rewritten to a nonexistent `/dashboard/auth/callback` path.
  If you ever touch `middleware.ts`, preserve that exclusion.

## Data model — draft vs. published

Two separate tables, not one table with a "draft" flag:

- **`profiles`** — public, published data. Publicly SELECT-able by anyone
  (`using (true)`). Only the owner can INSERT/UPDATE their own row
  (`auth.uid() = id`).
- **`profile_drafts`** — private. Only the owner can SELECT/INSERT/UPDATE
  their own row. Nobody else can even read it.

**Why two tables, not one with a boolean:** Postgres RLS can hide entire
*rows* from strangers but not individual *columns* within a row you're
otherwise allowed to see. If draft and published content lived in the
same row, there'd be real risk of leaking unpublished changes to the
public. Two tables sidesteps that entirely.

**Publish flow:** every edit-modal write goes to `profile_drafts` only.
Nothing public changes until the user hits "Publish," which copies the
relevant draft fields into `profiles` in one update. The dashboard shows
a status card ("Not published yet" / "Published" + "You have unpublished
changes") and the Publish button is disabled whenever draft and
published already match (no-op prevention), computed via a
`fieldsMatch()` helper.

Both `profiles` and `profile_drafts` have a `sections jsonb` column
(default `'[]'`) intended to hold structured block content (Stack,
Playlist, Building, etc.) without needing new migrations per block type.
**This is not yet used** — only the header fields (name, bio, location,
website, avatar_url, quote) are implemented as real columns so far.

## Editor pattern — WYSIWYG-lite, not a drag-and-drop builder

Deliberately **not** a Framer/Webflow-style free-form canvas. The layout
is a fixed bento grid (see the approved mockup —
`liyo-profile-mockup-palette3.html` in the repo root, the **active**
design reference; `palette2` is superseded — its layout became today's
2-row Mission+Building/Workspace then Productivity Stack/AI Workspace/
Preferred Starter Stack arrangement, and it's now also the source for
the actual color values, the dark-mode palette, and the sidebar's
Explore/Shelf nav grouping — see "Design system" and "Current build
state" below).
Each card has an edit-pencil / "Edit profile" button that opens a
**modal** scoped to just that block's fields. Save writes to the draft
and closes the modal; the card re-renders with the new data immediately.

This pattern (`components/dashboard/modal.tsx` is the generic shell) is
proven for the profile header and should be repeated for every future
block — new modal component + new draft field(s)/JSONB entry + publish
logic reuses the same `handlePublish` pattern already in
`shelf-editor.tsx`. See "Current build state" below for which blocks
exist today versus which were tried and later retired/removed.

## Design system

**Two separate color systems — don't confuse them:**

1. **The semantic CSS variables** (`--bg`, `--surface`, `--surface-2`,
   `--fg`, `--muted`, `--muted-2`, `--line`, `--line-2`, `--accent`,
   `--accent-fg`, `--accent-hover`, `--warm`, defined in
   `app/globals.css`'s `:root` and `.dark` blocks) are what actually
   drive the app's light/dark appearance, via the matching Tailwind
   classes (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`,
   `text-muted-2`, `border-line`, `border-line-2`, `bg-accent`,
   `text-accent-fg`, `hover:bg-accent-hover`, `text-warm`). **Every
   component that should visually adapt between modes must use these**,
   never a hardcoded hex or a raw palette token.
2. **The locked raw Tailwind palette** (`slate`, `oatmeal`, `sea`/
   `sea-deep`, `coral`/`coral-deep`/`coral-text`, `umber`/`umber-deep`/
   `umber-light`, `chartreuse`, defined in `tailwind.config.ts`) is a
   fixed, non-adaptive set of colors reserved for **decorative
   elements that should look identical in both modes** — the logo
   (`components/logo.tsx`), Building's live/in-progress status dots
   (`bg-sea-deep`/`bg-chartreuse`), the Workspace illustration's SVG
   fills, the Workspace card's location-badge overlay (`bg-slate/70` +
   `text-oatmeal` — a fixed dark-glass pill, intentionally the same
   regardless of page theme, like a photo caption), the modal
   backdrop's dim scrim (`bg-slate/40`), and the homepage's marketing
   decoration (`hero.tsx`, `shelf.tsx`). **Do not use these raw tokens
   for anything that reads as body text, a link, or an error/status
   message** — those need the semantic tokens above so they stay
   legible when the theme changes. (This distinction is why, e.g., the
   quote-card glyph and every form's error text were switched from
   `text-coral-deep`/`text-coral-text` to `text-warm` when dark mode
   went live — the old raw-coral versions were unreadable — dark
   maroon on a near-black card — once dark mode actually rendered;
   `sea-deep` was likewise swapped to `text-accent` wherever it was
   functioning as a link/accent color, e.g. the website link and the
   "View all N" overflow links, for the same reason.)

Palette (raw tokens, locked — do not reintroduce the original
neon-green iteration):

- **Slate** `#2B2539` — dark-glass overlays (see above)
- **Oatmeal** `#EBE9E4` — text-on-slate-overlay color
- **Sea** `#BED3CC` / **Sea deep** `#7FA394` — status dots, decorative
  illustration fills
- **Coral** `#EFC8C8` / **Coral deep** `#C98D8D` / **Coral text**
  `#7A3D3D` — homepage-only decorative use now (`shelf.tsx`); no
  longer used for the quote glyph or error text (see above)
- **Umber** `#7B6767` / **Umber deep** `#5A4A4A` / **Umber light**
  `#A08D8D` — shelf ledges (literal wood tone), Workspace illustration
- **Chartreuse** `#EEEFC8` — rare, tiny pop only (e.g. the homepage
  hero's eyebrow dot, Building's "in progress" status dot). Never use
  it for anything larger — it stops reading as a deliberate accent if
  overused.

**Dark mode is live** (toggle in the dashboard sidebar; see "Current
build state" below for the full implementation). The semantic CSS
variable *values* come from `liyo-profile-mockup-palette3.html`'s
`:root`/`[data-theme="dark"]` blocks — that mockup is the source of
truth for both palettes, ported onto our pre-existing variable names
(see the mapping comment at the top of `app/globals.css`) so no
component had to change which Tailwind class it uses, only the
variable definitions changed. `--ledge-a`/`--ledge-b` (the homepage's
wood-tone shelf ledges) aren't part of the mockup and were left
unchanged in both modes.

Fonts: DM Sans (body/headings) + DM Mono (labels, tags, code-ish bits),
loaded via `next/font/google` in `app/layout.tsx`.

## Field constraints — enforced at 3 layers, keep all 3 in sync

Every user-editable field limit follows the same pattern: a Postgres
`check` constraint (real enforcement, can't be bypassed via direct API
calls), a live counter in the edit modal, and a `maxLength` on the input
itself. If you add or change a limit, update all three.

- **Bio:** max 200 characters. Constraint name: `bio_max_length` (on
  both `profiles` and `profile_drafts`).
- **Quote:** max 150 characters. Column `quote text`, constraint
  `quote_max_length` (added to both tables, migration already run —
  **UI for this is not yet built**, see "In progress" below).
- **Username:** min 2 characters, must not collide with the reserved
  list (constraint `username_not_reserved`):
  - Personal: `pb`, `pieterborremans`, `borremanspieter`
  - System: `liyo`, `admin`, `support`, `help`, `api`, `about`,
    `settings`, `login`, `dashboard`
  - Ryoka portfolio brand names (protected until each product gets its
    own shelf): `sorano`, `kiroka`, `strevius`, `ryoka`, `two`,
    `studybrew`, `indiehacker`, `kira`, `kirapulse`, `harova`,
    `echoroom`, `aegos`
  - To free up a reserved word later: `drop constraint
    username_not_reserved` then `add constraint` again with the word
    removed from the list — same pattern used to add words to it.
- **Avatar:** 2MB max, image MIME types only
  (`image/jpeg, image/png, image/webp, image/gif`), enforced via
  `file_size_limit` + `allowed_mime_types` on the Supabase Storage
  `avatars` bucket itself — **not just client-side JS**, since a client
  check alone is bypassable via direct API calls. Client-side check in
  `edit-profile-modal.tsx` exists purely for instant user feedback, not
  as the real security boundary.

## Storage — avatars bucket

Public bucket named `avatars`. Files are stored under
`avatars/{user_id}/{timestamp}.{ext}` — the folder-per-user structure is
what the RLS-equivalent storage policies key off:
`(storage.foldername(name))[1] = auth.uid()::text` for INSERT/UPDATE.
SELECT is public (bucket is public). Don't flatten this folder structure
without updating the storage policies to match.

## Known gotcha — silently dropped `<a>` tags

During development (via a GitHub web editor copy-paste workflow, not
Cursor), literal `<a` tags immediately followed by a line break were
repeatedly, silently stripped somewhere in the copy pipeline — producing
confusing SWC errors like `Unexpected token. Expected jsx identifier`
pointing at an unrelated later line. The fix used throughout the
codebase was writing anchor tags as a **single line** rather than
multi-line/multi-attribute, e.g.:

```tsx
<a href={url} target="_blank" rel="noreferrer" className="...">{label}</a>
```

This is unlikely to recur in Cursor (direct file writes, not
copy-paste), but if you ever see a JSX parse error that seems to point
at the wrong line, check nearby for a missing opening tag before
assuming the reported line is where the real problem is.

## Current build state

**Done:**
- Auth (magic link), subdomain routing, username claiming with reserved
  words + min length
- Public profile route (`app/[username]/page.tsx`) — shows avatar, name,
  bio, location, website (as a clickable link), and a "still being
  built" placeholder card when none of the built-out blocks (Mission &
  Building, Workspace) have content
- Dashboard shell + sidebar (`components/dashboard/dashboard-shell.tsx`,
  `sidebar.tsx`) — nav is still just logo + "Home" (built to extend with
  more nav sections later), but the sidebar is now a **client component**
  with two jobs beyond nav: it takes an optional `liveUrl` prop (only
  passed once the user has a claimed username — see
  `app/dashboard/page.tsx`) and pins "View your live shelf" + "Log out"
  to the bottom of the column via `mt-auto` on their wrapper, separated
  from the nav above by a `border-t` divider. `Log out`'s handler
  (Supabase `signOut()` + redirect to `/login`) now lives here — it used
  to live in `shelf-editor.tsx`, see "Header/sidebar reshuffle" below.
- Profile header block, fully working end-to-end: edit modal
  (`edit-profile-modal.tsx`), avatar upload with 2MB cap, draft/publish
  flow (`shelf-editor.tsx`), Share button (copies public URL to
  clipboard), positioned as a page-level toolbar top-right, matching
  the approved mockup — **not** nested inside the narrower profile-card
  column. The toolbar is now **[status label] [Publish] [Share] [Edit
  profile]** left to right — see "Header/sidebar reshuffle" below for
  what moved and why.
- Quote field — Quote textarea + 150-char counter in
  `edit-profile-modal.tsx`, pull-quote card (quotation glyph, italic
  line, "— Name" attribution) rendered top-right near the header in
  both `shelf-editor.tsx` (dashboard) and `app/[username]/page.tsx`
  (public), only shown when a quote is set; `app/dashboard/page.tsx`
  fetches/passes the column alongside the other header fields
- **`sections jsonb` is now in use**, via `lib/sections.ts`: it holds an
  array of typed blocks (`{ type, ...fields }`), e.g.
  `{ type: "workspace_gear", items: string[] }` and object-array blocks
  like `{ type: "building", items: BuildingItem[] }`. `getSection` reads
  a block by type; `getSectionItems` is a `string[]`-only convenience
  wrapper (only `workspace_gear` uses it now) — use `getSection(...)
  ?.items` directly for object-array blocks instead. `upsertSection`
  replaces just one block's entry while leaving every other block in
  the array untouched — this is the pattern any future block should
  reuse rather than inventing per-block storage.
- **Mission & Building card** — one card, two columns, an 8/4-of-12
  split with Workspace (see below). `mission` is a real column
  (`profiles.mission` / `profile_drafts.mission`, 400-char cap enforced
  by a DB check constraint added by hand, per this project's usual
  3-layer-limit pattern), edited through `edit-mission-modal.tsx`
  (mission text only now — see "Retired" below for what used to sit
  next to it). The right column reuses Building's rendering as-is:
  project name + status dot (`"live"` = `bg-sea-deep`, `"in_progress"`
  = `bg-chartreuse`, the design system's one sanctioned use of
  chartreuse) + URL + short description, unlimited items, first 3 shown
  inline with a "View all N" overflow modal for the rest. That
  items-or-empty-state-plus-overflow-modal logic lives in
  `BuildingList` (`components/building-card.tsx`) — a plain list
  renderer with no card wrapper or label of its own, so it can sit
  inside another card's column instead of only working as a standalone
  bordered card. Edited through the unchanged `edit-building-modal.tsx`
  via its own edit-pencil button (each column in this card gets its own
  button now, not one button for the whole card — see the z-index
  gotcha below, which applies per-column here). Storage:
  `sections.building`, unchanged.
- Workspace card — no photo upload; the "photo" area is a **fixed**
  isometric desk illustration (`components/workspace-illustration.tsx`
  — desk, monitor, mug, plant), plain inline SVG using the `fill-sea`/
  `fill-sea-deep`/`fill-umber`/`fill-umber-deep`/`fill-umber-light`
  Tailwind color utilities (Tailwind's `fill-*`/`stroke-*` core
  plugins read straight from `theme.colors`, so any palette token
  already works as a `fill-`/`stroke-` class with no extra config).
  **Identical for every user — not seeded or generated.** An earlier
  version generated a per-user deterministic gradient
  (`lib/workspace-gradient.ts`, hash-of-username → palette pair); that
  file was deleted and the approach abandoned in favor of one fixed
  asset, so don't reintroduce per-user generation here without reason.
  The city badge reuses the existing `location` field, not a new
  column. Gear is a capped list (max 12, `WORKSPACE_GEAR_MAX_ITEMS`)
  rendered 2-column, edited through `edit-workspace-modal.tsx` via the
  same `EditableItemList`.
- Both new cards always render on the dashboard (owner-only), even
  empty, so there's a pencil-button entry point to fill them in for the
  first time — the "only show a card if it has content" rule from
  `CLAUDE.md`'s design intent applies to the **public** page
  (`app/[username]/page.tsx`), which hides each card until it has real
  content, same as bio/quote already do.
- Mission/Building and Workspace sit **side by side in one row**,
  an 8/4-of-12 split (`grid grid-cols-1 gap-4 sm:grid-cols-12`, cards
  use `sm:col-span-8`/`sm:col-span-4`) matching the mockup's bento
  proportions — on both `shelf-editor.tsx` and `app/[username]/page.tsx`.
  The profile card + Quote card row above it uses a simpler two-card
  technique instead (`flex-1` grows to fill space, the narrower card is
  `flex-shrink-0` + a fixed width) since it doesn't need an exact
  fractional split. On the public page, since either card can be absent
  independently (only the dashboard always renders both), the span is
  computed at runtime — `sm:col-span-12` instead of 8 or 4 whenever the
  other card has no content — so a lone card fills the row rather than
  sitting at 66%/33% width with dead space beside it.
  Two gotchas worth remembering for future side-by-side card rows:
  - Any per-card edit-pencil button (`CardEditButton`, absolutely
    positioned) needs an explicit `z-10`. A card's own inner content
    (e.g. the Workspace illustration's wrapper div, which is
    `position: relative` so the location badge can sit inside it) is
    often `position: relative` too — CSS stacks same-z-index positioned
    siblings in DOM order, so without an explicit z-index the
    later-in-DOM inner content can paint over an earlier
    absolutely-positioned button and make it unclickable, even though
    it visually looks like it's "on top."
  - Each card in a `flex` row needs its own `w-full` + either `flex-1`
    (grows) or `flex-shrink-0` + a fixed width (stays narrow) — giving
    both cards plain `w-full` with no flex sizing collapses them back
    into a stacked column instead of a row. (Cards in a `grid` row
    avoid this — an explicit `col-span-*` is enough.)
- **Content max-width is 1180px**, matching the approved mockup's
  `.content` container (`liyo-profile-mockup-palette3.html` — width
  next to its sidebar). Both `shelf-editor.tsx`'s outermost wrapper
  and `app/[username]/page.tsx`'s `<main>` use
  `max-w-[1180px]`, not the earlier, too-narrow `max-w-[760px]` (which
  caused short text like tool/gear names to wrap awkwardly). Any new
  card row should size itself within this same 1180px column rather
  than introducing its own narrower max-width — that's what caused this
  bug in the first place: the profile header card was capped at
  `max-w-[560px]` independently of the row width, so it looked narrow
  above wider rows once those rows were widened. Keep the header
  profile card sized with `flex-1` (no independent max-width) so it
  always spans whatever the shared container width is.
- **Productivity Stack, AI Workspace, and Preferred Starter Stack** —
  the row below Mission/Building + Workspace, three equal cards
  (`sm:col-span-4` each of 12). All three are **identical in shape**
  (each item is just `{ name, url }`) and share one modal component,
  `edit-stack-modal.tsx`, parametrized by `sectionType` (
  `"productivity_stack"` | `"ai_workspace"` | `"preferred_starter_stack"`)
  and `title` — and one display component, `components/stack-card.tsx`.
  Storage: `sections.productivity_stack` / `sections.ai_workspace` /
  `sections.preferred_starter_stack`, same `getSection`/`upsertSection`
  pattern as every other block. None of the three have an item cap —
  genuinely unlimited, first 3 shown inline with a "View all N"
  overflow modal for the rest, same as Building. Naming notes:
  - The mockup's "Tools of the Trade" card was renamed **Productivity
    Stack** before it was ever actually built — it never existed under
    the old name in code, only in a roadmap list, so there was nothing
    to migrate.
  - **Preferred Starter Stack** was likewise renamed from the
    mockup/roadmap's "Partner Shelf" before any code for it existed —
    don't reintroduce either old name. Framing: the boilerplate/default
    toolkit a dev reaches for on a new project (e.g. Vercel + Supabase
    + Clerk + Tailwind), distinct from Productivity Stack (daily tools)
    and AI Workspace (AI models). It moved into this row from a since-
    removed third row (see "Removed" below) — its rendering/editing
    code is untouched, only its position changed.
  - **No icon upload, no icon picker** for any of the three, or for
    Building. Every item's icon is auto-fetched via Google's public
    favicon service (`https://www.google.com/s2/favicons?domain=
    {domain}&sz=128`, no key required) — see `lib/logo.ts`
    (`domainFromUrl`/`googleFaviconUrl`) and `components/item-logo.tsx`
    (a small client component that renders the `<img>`, and on
    `onError` — or no URL at all — falls back to a monogram in the same
    visual style as the avatar fallback elsewhere). **This is the
    pattern to reuse** for anything that's fundamentally "a list of
    external links/tools/companies" instead of adding another upload
    field or icon picker. **Do not use Clearbit's logo API for this or
    any future block** — `logo.clearbit.com` was shut down permanently
    on 2025-12-08, which is why this was switched to Google's favicon
    service.
  - Same empty-state rule as Mission/Building/Workspace: all three
    always render on the dashboard (with a pencil-button entry point,
    even with zero items), but each only renders on the public page
    when it has at least one item. Since the public page can have any
    subset of the three present, the column span is computed at
    runtime (12/6/4 for 1/2/3 visible cards) the same way the
    Mission/Workspace row already does it.
- **Header/sidebar reshuffle** — the dashboard's account/publish
  controls used to live in a bottom-of-page status card ("Published"/
  "Not published yet" + a Publish button) and a bottom-of-page footer
  ("View your live shelf", "Log out"). Both moved, presentation-only —
  none of the underlying publish/share/sign-out logic changed:
  - **Publish** joined the top-right toolbar in `shelf-editor.tsx`,
    to the left of Share and Edit profile: `[status label] [Publish]
    [Share] [Edit profile]`. The old two-line status text ("Published"/
    "Not published yet" + "You have unpublished changes."/"Draft
    matches your live shelf.") is condensed to one small muted label —
    `statusLabel` — computed from the same `isPublished`/`hasChanges`
    values as before (`"Unpublished changes"` / `"Draft matches live"` /
    `"Not published yet"`); the full original two-line wording survives
    as a `title` tooltip (`statusTitle`) rather than always being shown
    inline, per the "condense text, keep the detail in a tooltip if
    space is tight" approach used here. The Publish button itself
    (disabled state, `handlePublish`) is unchanged, just relocated. The
    publish-error message (`error` state) moved with it, right-aligned
    under the toolbar instead of under the old bottom card.
  - **"View your live shelf" and "Log out"** moved from a footer inside
    `shelf-editor.tsx` to the bottom of `sidebar.tsx` (see above) — this
    is why `Sidebar` became a client component and gained a `liveUrl`
    prop. `app/dashboard/page.tsx` passes `liveUrl` to `DashboardShell`
    only on the path where a `profiles` row already exists (i.e. not on
    the `ClaimUsernameForm` path, since there's no username yet to link
    to) — `DashboardShell` forwards it straight to `Sidebar`. Link/log
    -out styling (`text-muted` for Log out) is carried over unchanged,
    just in a vertical stack instead of a horizontal row, with a
    `border-t` divider above it consistent with divider styling used
    elsewhere. (The live-shelf link's color was later switched from
    `text-sea-deep` to `text-accent` when dark mode went live — see
    below — so it'd actually adapt between themes; that's the only
    thing about it that's changed since this reshuffle.)
  - **Scope note:** this only touched the dashboard. The public profile
    page (`app/[username]/page.tsx`) never had any of this UI (no
    Publish/live-shelf-link/log-out there) and wasn't touched.
- **Header alignment fix** — the toolbar row (status/Publish/Share/
  Edit profile) used to be a sibling *before* the `max-w-[1180px]`
  content wrapper in `shelf-editor.tsx`, so it spanned the full flex
  area next to the sidebar (wider than 1180px on large viewports) while
  the cards below were capped at 1180px — the toolbar's right edge and
  the cards' right edge didn't line up. Fixed by moving the toolbar
  **inside** the same `max-w-[1180px]` wrapper as everything else,
  instead of introducing a second, duplicate max-width container. The
  public profile page never had this problem (its `<main>` was already
  the single outermost `max-w-[1180px]` element with nothing outside
  it).
- **Dark mode is live.** Implementation, end to end:
  - `lib/theme.ts` exports `THEME_STORAGE_KEY` (`"liyo-theme"`, a
    `localStorage` key) and `THEME_INIT_SCRIPT`, a blocking script
    string. `app/layout.tsx` renders that script inside a manual
    `<head>` (App Router root layouts render the full document shell,
    so this is a supported place for it) *before* `{children}` — it
    runs before hydration, reads the stored choice or falls back to
    `prefers-color-scheme`, and adds the `dark` class straight to
    `document.documentElement` if needed. This is what avoids a flash
    of the wrong theme on first paint. The `<html>` tag has
    `suppressHydrationWarning` because this script intentionally
    mutates its class before React hydrates it — that's expected, not
    a bug to fix.
  - `components/dashboard/theme-toggle.tsx` (`ThemeToggle`) is the
    explicit Dark/Light control — a small two-button pill matching the
    mockup, rendered only in `components/dashboard/sidebar.tsx`, above
    the "View your live shelf"/Log out block. It starts with **neither**
    button highlighted (matching what's server-rendered, since
    `document` doesn't exist during SSR) and reads the real state via
    `useEffect` after mount — reading `document.documentElement` during
    the initial render instead would create a hydration mismatch, so
    don't "simplify" this to a lazy `useState` initializer. Clicking a
    button toggles the `dark` class directly and writes to
    `localStorage` via `THEME_STORAGE_KEY`.
  - **The public profile page has no toggle and just follows system
    preference** — this was a deliberate choice, not an oversight.
    Reasoning: (1) the page is meant to be a clean, shareable link,
    not a settings surface for visitors; (2) since the dashboard lives
    on `shelf.liyo.dev` and the public page on bare `liyo.dev` —
    different origins — `localStorage` is naturally isolated between
    them anyway, so a dashboard user's explicit theme choice was never
    going to carry over to visits on the public domain regardless; it
    falls back to system preference there every time, which is exactly
    the desired behavior with zero extra code required to enforce it.
  - **Every existing component was audited for raw, non-adaptive color
    usage that would break in dark mode** — see the "Design system"
    section above for the full list of what got switched from a raw
    palette token to a semantic one (`text-coral-deep`/`text-coral-text`
    → `text-warm`; `text-sea-deep` → `text-accent` for functional
    links) versus what was intentionally left raw (status dots, the
    logo, the Workspace location-badge overlay, the modal backdrop,
    homepage decoration). Mission, Building, Workspace, Productivity
    Stack, AI Workspace, Preferred Starter Stack, Quote, and the
    profile header all already used the semantic tokens for their
    actual content and needed no structural changes — only those
    specific raw-token spots needed fixing.
- **Sidebar now shows hardcoded Explore and Shelf nav sections** —
  `Explore` (Founders, Stacks, Tools, Collections) and `Shelf` (Books,
  Apps, Podcasts, Playlists, Gear, Places), rendered via a small
  `NavSection` helper in `sidebar.tsx`, matching the mockup's grouping
  exactly. **These are placeholder/visual only** — every item links to
  `href="#"`, none of them are wired to real routes or data, and none
  of this was built out as actual pages. This is purely so the sidebar
  visually matches the mockup while a decision on whether to build any
  of it out is still pending — don't mistake these for real nav or
  start building `/explore/founders`-style routes without a fresh
  decision to do so.

**Retired / removed** (so nobody rebuilds these by accident):
- **Current Focus** (the checklist that used to sit next to Mission,
  `sections.current_focus`, capped at 6 items via
  `CURRENT_FOCUS_MAX_ITEMS`) was retired — replaced by Building's
  rendering in that same column. Removed cleanly: nothing else
  referenced `current_focus`, `CurrentFocusSection`, or
  `CURRENT_FOCUS_MAX_ITEMS`, so the type, the constant, and the
  editing UI in `edit-mission-modal.tsx` were deleted outright, not
  deferred. `EditableItemList` (`components/dashboard/
  editable-item-list.tsx`) is still very much alive — Workspace Gear
  still uses it — only its Current Focus caller went away.
- **Playlist for Work and Currently Reading were removed entirely**
  (not deferred) — the whole third row they used to occupy (alongside
  Preferred Starter Stack, which moved up into the row above instead)
  is gone. Deleted outright: `components/playlist-card.tsx`,
  `components/dashboard/edit-playlist-modal.tsx`, `lib/spotify.ts`
  (Playlist for Work); `components/currently-reading-card.tsx`,
  `components/dashboard/edit-currently-reading-modal.tsx`,
  `lib/openlibrary.ts`, and `app/api/book-cover/route.ts` (Currently
  Reading — this route had already been reduced to an unused stub in a
  prior pass; it's now gone completely rather than left as dead code).
  If either of these gets revisited, it'll be built fresh rather than
  restored from history — treat any old references to a
  `PlaylistCard`, `CurrentlyReadingCard`, `BookCoverPlaceholder`, or
  the Open Library lookup as stale.
  - **Orphaned DB columns/fields — schema was deliberately left alone
    in this pass, only the app code stopped reading/writing them:**
    `profiles.playlist_url` / `profile_drafts.playlist_url` (real
    columns) are no longer selected, written, or rendered anywhere.
    Any already-published `sections` jsonb blobs may still contain old
    `{ type: "currently_reading", items: [{ title, author, cover_url
    }] }` or `{ type: "current_focus", items: [...] }` entries from
    before this change — `upsertSection`/`getSection` simply ignore
    block types nothing asks for by name, so this is inert, not a bug.
    **Dropping the `playlist_url` columns (and, if ever desired,
    scrubbing old section types out of existing `sections` rows) is a
    separate, dedicated migration for later** — deliberately not done
    here.

**In progress / next up:**
- Whether to actually build out the sidebar's Explore/Shelf sections
  (currently hardcoded/inert placeholders — see "Current build state"
  above) is an open decision, not started either way.
- Homepage sections beyond the hero (how-it-works, examples grid) —
  not started.

## Workflow note

This project was built almost entirely through the GitHub web editor
(no local terminal), which is why history may show unusually granular
single-file commits. That constraint doesn't apply in Cursor — feel free
to make multi-file changes, run `npm install`, and use git normally.