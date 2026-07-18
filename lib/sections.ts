export interface CurrentFocusSection {
  type: "current_focus";
  items: string[];
}

export interface WorkspaceGearSection {
  type: "workspace_gear";
  items: string[];
}

export type SectionBlock = CurrentFocusSection | WorkspaceGearSection;

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

export function getSectionItems(
  sections: SectionBlock[] | null | undefined,
  type: SectionBlock["type"]
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
