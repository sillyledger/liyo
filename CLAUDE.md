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
`liyo-profile-mockup-palette2.html` if still in the repo/chat history).
Each card has an edit-pencil / "Edit profile" button that opens a
**modal** scoped to just that block's fields. Save writes to the draft
and closes the modal; the card re-renders with the new data immediately.

This pattern (`components/dashboard/modal.tsx` is the generic shell) is
proven for the profile header and should be repeated for every future
block (Stack, Playlist, Building, AI Workspace, Partner Shelf, Currently
Reading) — new modal component + new draft field(s)/JSONB entry + publish
logic reuses the same `handlePublish` pattern already in
`shelf-editor.tsx`.

## Design system

Palette (locked, do not reintroduce the original neon-green iteration):

- **Slate** `#2B2539` — dark-mode background
- **Oatmeal** `#EBE9E4` — light-mode background (**light mode is the
  current build target**)
- **Sea** `#BED3CC` / **Sea deep** `#7FA394` — primary accent (buttons,
  badges, live-status dots, links)
- **Coral** `#EFC8C8` / **Coral deep** `#C98D8D` / **Coral text**
  `#7A3D3D` — warm secondary accent (book covers, "Building" tiles)
- **Umber** `#7B6767` / **Umber deep** `#5A4A4A` / **Umber light**
  `#A08D8D` — shelf ledges (literal wood tone) + neutral UI
- **Chartreuse** `#EEEFC8` — rare, tiny pop only (e.g. the eyebrow dot on
  the homepage hero). Never use it for anything larger — it stops
  reading as a deliberate accent if overused.

**Dark mode is wired but dormant.** `app/globals.css` has a full `.dark`
CSS-variable block already written (values mirror the light block, just
swapped), and `tailwind.config.ts` has `darkMode: "class"` set. Turning
it on later is just: build a toggle, add the `dark` class to `<html>`.
**Zero component rewrites needed — as long as every component keeps
using the semantic tokens** (`bg-bg`, `bg-surface`, `bg-surface-2`,
`text-fg`, `text-muted`, `text-muted-2`, `border-line`, `border-line-2`,
`bg-accent`, `text-accent-fg`, `bg-accent-hover`, `text-warm`) rather
than hardcoded palette values for anything that should visually adapt
between modes. The *only* places raw palette tokens (`bg-sea`,
`text-coral-deep`, `bg-umber-light`, etc.) are correct to use are
decorative/branded elements that should look the same in both modes —
the logo, book cover gradients, tool icon colors.

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
  Current Focus, Workspace) have content
- Dashboard shell + sidebar (`components/dashboard/dashboard-shell.tsx`,
  `sidebar.tsx`) — currently just logo + "Home," built to extend with
  more nav sections later
- Profile header block, fully working end-to-end: edit modal
  (`edit-profile-modal.tsx`), avatar upload with 2MB cap, draft/publish
  flow (`shelf-editor.tsx`), Share button (copies public URL to
  clipboard), positioned as a page-level toolbar (Share + Edit profile)
  top-right, matching the approved mockup — **not** nested inside the
  narrower profile-card column
- Quote field — Quote textarea + 150-char counter in
  `edit-profile-modal.tsx`, pull-quote card (quotation glyph, italic
  line, "— Name" attribution) rendered top-right near the header in
  both `shelf-editor.tsx` (dashboard) and `app/[username]/page.tsx`
  (public), only shown when a quote is set; `app/dashboard/page.tsx`
  fetches/passes the column alongside the other header fields
- **`sections jsonb` is now in use**, via `lib/sections.ts`: it holds an
  array of typed blocks (`{ type, ...fields }`), e.g.
  `{ type: "current_focus", items: string[] }` and
  `{ type: "workspace_gear", items: string[] }`. `getSection`/
  `getSectionItems` read a block by type; `upsertSection` replaces just
  that one block's entry while leaving every other block in the array
  untouched — this is the pattern future blocks (Building, AI
  Workspace, Partner Shelf, Playlist, Currently Reading) should reuse
  rather than inventing per-block storage.
- Mission & Current Focus card — one card, two columns. `mission` is a
  real column (`profiles.mission` / `profile_drafts.mission`, 400-char
  cap enforced by a DB check constraint added by hand, per this
  project's usual 3-layer-limit pattern). Current Focus is a capped list (max 6, `CURRENT_FOCUS_MAX_ITEMS` in
  `lib/sections.ts`) of individually editable/removable text rows via
  the shared `EditableItemList` component
  (`components/dashboard/editable-item-list.tsx`). Edited through
  `edit-mission-modal.tsx`. Rendered with a checkmark-style checklist.
- Workspace card — no photo upload; the "photo" area is a deterministic
  abstract gradient from `lib/workspace-gradient.ts` (hashes a seed —
  currently the username — into one of a few palette-token gradient
  pairs, so the same person always sees the same gradient). The city
  badge reuses the existing `location` field, not a new column. Gear is
  a capped list (max 12, `WORKSPACE_GEAR_MAX_ITEMS`) rendered 2-column,
  edited through `edit-workspace-modal.tsx` via the same
  `EditableItemList`.
- Both new cards always render on the dashboard (owner-only), even
  empty, so there's a pencil-button entry point to fill them in for the
  first time — the "only show a card if it has content" rule from
  `CLAUDE.md`'s design intent applies to the **public** page
  (`app/[username]/page.tsx`), which hides each card until it has real
  content, same as bio/quote already do.
- Mission/Current Focus and Workspace sit **side by side in one row**
  (Mission wider via `flex-1`, Workspace fixed-width via `flex-shrink-0
  sm:w-[240px]`), on both `shelf-editor.tsx` and
  `app/[username]/page.tsx` — same two-card-row technique already used
  for the profile card + Quote card. Two gotchas worth remembering for
  future side-by-side card rows:
  - Any per-card edit-pencil button (`CardEditButton`, absolutely
    positioned) needs an explicit `z-10`. A card's own inner content
    (like the Workspace gradient box) is often `position: relative`
    too — CSS stacks same-z-index positioned siblings in DOM order, so
    without an explicit z-index the later-in-DOM inner content can
    paint over an earlier absolutely-positioned button and make it
    unclickable, even though it visually looks like it's "on top."
  - Each card in the row needs its own `w-full` + either `flex-1`
    (grows) or `flex-shrink-0` + a fixed width (stays narrow) — giving
    both cards plain `w-full` with no flex sizing collapses them back
    into a stacked column instead of a row.

**In progress / next up:**
- Everything else from the bento grid mockup (Tools of the Trade,
  Building, AI Workspace, Partner Shelf, Playlist, Currently Reading) —
  none of these have modals or schema yet. Follow the same
  3-layer-constraint + modal + draft/publish pattern established for
  the header fields, and reuse the `lib/sections.ts` block-array
  pattern for anything list-shaped.
- Dark mode toggle (deferred on purpose — see Design System section
  above; foundation is ready, just needs the toggle UI + `dark` class
  wiring in `app/layout.tsx`).
- Homepage sections beyond the hero (how-it-works, examples grid) —
  not started.

## Workflow note

This project was built almost entirely through the GitHub web editor
(no local terminal), which is why history may show unusually granular
single-file commits. That constraint doesn't apply in Cursor — feel free
to make multi-file changes, run `npm install`, and use git normally.