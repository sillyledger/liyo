export interface CurrentFocusSection {
  type: "current_focus";
  items: string[];
}

export interface WorkspaceGearSection {
  type: "workspace_gear";
  items: string[];
}

/** Shared item shape for Productivity Stack and AI Workspace — name + an optional link. */
export interface StackItem {
  name: string;
  url: string | null;
}

export interface ProductivityStackSection {
  type: "productivity_stack";
  items: StackItem[];
}

export interface AiWorkspaceSection {
  type: "ai_workspace";
  items: StackItem[];
}

export type BuildingStatus = "live" | "in_progress";

export interface BuildingItem {
  name: string;
  url: string | null;
  description: string | null;
  status: BuildingStatus;
}

export interface BuildingSection {
  type: "building";
  items: BuildingItem[];
}

/** Same shape as Productivity Stack / AI Workspace — the boilerplate/default toolkit a dev reaches for on a new project. */
export interface PreferredStarterStackSection {
  type: "preferred_starter_stack";
  items: StackItem[];
}

export interface CurrentlyReadingItem {
  title: string;
  author: string;
  /** Resolved via the Open Library title/author lookup; null falls back to a placeholder cover. */
  cover_url: string | null;
}

export interface CurrentlyReadingSection {
  type: "currently_reading";
  items: CurrentlyReadingItem[];
}

export type SectionBlock =
  | CurrentFocusSection
  | WorkspaceGearSection
  | ProductivityStackSection
  | AiWorkspaceSection
  | BuildingSection
  | PreferredStarterStackSection
  | CurrentlyReadingSection;

export const CURRENT_FOCUS_MAX_ITEMS = 6;
export const WORKSPACE_GEAR_MAX_ITEMS = 12;

export function getSection<T extends SectionBlock["type"]>(
  sections: SectionBlock[] | null | undefined,
  type: T
): Extract<SectionBlock, { type: T }> | undefined {
  return sections?.find((block) => block.type === type) as
    | Extract<SectionBlock, { type: T }>
    | undefined;
}

/** For the two plain-string-list blocks only — Current Focus and Workspace Gear. */
export function getSectionItems(
  sections: SectionBlock[] | null | undefined,
  type: "current_focus" | "workspace_gear"
): string[] {
  return getSection(sections, type)?.items ?? [];
}

/** Replaces the block of `block.type` in `sections`, preserving every other block untouched. */
export function upsertSection(
  sections: SectionBlock[] | null | undefined,
  block: SectionBlock
): SectionBlock[] {
  const rest = (sections ?? []).filter((existing) => existing.type !== block.type);
  return [...rest, block];
}

export function sectionsMatch(
  a: SectionBlock[] | null | undefined,
  b: SectionBlock[] | null | undefined
): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
}
