"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EditProfileModal } from "./edit-profile-modal";
import { EditMissionModal } from "./edit-mission-modal";
import { EditWorkspaceModal } from "./edit-workspace-modal";
import { EditStackModal } from "./edit-stack-modal";
import { EditBuildingModal } from "./edit-building-modal";
import { getSection, getSectionItems, sectionsMatch, type SectionBlock } from "@/lib/sections";
import { WorkspaceIllustration } from "@/components/workspace-illustration";
import { StackCard } from "@/components/stack-card";
import { BuildingCard } from "@/components/building-card";
import { CARD_TAG } from "@/lib/styles";

interface ProfileFields {
  name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  quote: string | null;
  mission: string | null;
  sections: SectionBlock[];
}

interface ShelfEditorProps {
  userId: string;
  username: string;
  draft: ProfileFields;
  published: (ProfileFields & { published_at: string | null }) | null;
}

function fieldsMatch(a: ProfileFields, b: ProfileFields | null) {
  if (!b) return false;
  return (
    a.name === b.name &&
    a.bio === b.bio &&
    a.location === b.location &&
    a.website === b.website &&
    a.avatar_url === b.avatar_url &&
    a.quote === b.quote &&
    a.mission === b.mission &&
    sectionsMatch(a.sections, b.sections)
  );
}

function CardEditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 20l4-1 11-11-3-3L5 16l-1 4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function ShelfEditor({ userId, username, draft, published }: ShelfEditorProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showEditMission, setShowEditMission] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showEditProductivityStack, setShowEditProductivityStack] = useState(false);
  const [showEditAiWorkspace, setShowEditAiWorkspace] = useState(false);
  const [showEditBuilding, setShowEditBuilding] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPublished = published?.published_at != null;
  const hasChanges = !fieldsMatch(draft, published);
  const liveUrl = `https://liyo.dev/${username}`;

  async function handlePublish() {
    setPublishStatus("publishing");
    setError(null);

    const supabase = createClient();
    const { error: publishError } = await supabase
      .from("profiles")
      .update({
        name: draft.name,
        bio: draft.bio,
        location: draft.location,
        website: draft.website,
        avatar_url: draft.avatar_url,
        quote: draft.quote,
        mission: draft.mission,
        sections: draft.sections,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (publishError) {
      setPublishStatus("error");
      setError(publishError.message);
      return;
    }

    setPublishStatus("idle");
    router.refresh();
  }

  async function handleShare() {
    await navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (draft.name || username).charAt(0).toUpperCase();
  const currentFocusItems = getSectionItems(draft.sections, "current_focus");
  const gearItems = getSectionItems(draft.sections, "workspace_gear");
  const productivityItems = getSection(draft.sections, "productivity_stack")?.items ?? [];
  const aiWorkspaceItems = getSection(draft.sections, "ai_workspace")?.items ?? [];
  const buildingItems = getSection(draft.sections, "building")?.items ?? [];

  return (
    <div className="w-full">
      {/* Page-level toolbar — spans the full content width, matching the mockup's true top-right positioning */}
      <div className="mb-6 flex w-full justify-end gap-2">
        <button
          onClick={handleShare}
          className="rounded-[10px] border border-line-2 px-4 py-[9px] text-[13.5px] font-medium text-fg hover:border-fg"
        >
          {copied ? "Copied!" : "Share"}
        </button>
        <button
          onClick={() => setShowEdit(true)}
          className="rounded-[10px] bg-accent px-4 py-[9px] text-[13.5px] font-semibold text-accent-fg hover:bg-accent-hover"
        >
          Edit profile
        </button>
      </div>

      <div className="flex w-full max-w-[1180px] flex-col">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
          <div className="w-full flex-1 rounded-[16px] border border-line bg-surface p-8">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border border-line-2 bg-gradient-to-br from-surface-2 to-bg font-mono text-[14px] text-muted">
              {draft.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.avatar_url} alt={draft.name || username} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>

            <h1 className="mt-4 text-[21px] font-bold tracking-[-0.01em] text-fg">
              {draft.name || `@${username}`}
            </h1>
            <p className="text-[13.5px] text-muted">@{username}</p>

            {draft.bio && (
              <p className="mt-3 text-[14px] leading-[1.55] text-muted">{draft.bio}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] text-muted-2">
              {draft.location && <span>{draft.location}</span>}
              {draft.website && <span>{draft.website}</span>}
            </div>
          </div>

          {draft.quote && (
            <div className="w-full flex-shrink-0 rounded-[16px] border border-line bg-surface p-6 sm:max-w-[240px]">
              <span className="font-serif text-[40px] leading-none text-coral-deep">&ldquo;</span>
              <p className="mt-1 text-[14px] italic leading-[1.55] text-fg">{draft.quote}</p>
              <p className="mt-3 text-[12.5px] text-muted-2">— {draft.name || username}</p>
            </div>
          )}
        </div>

        {/* These two cards always render on the dashboard (owner-only) so there's
            an edit-pencil entry point before any content exists; the public
            profile hides them entirely until they have content. Side by side —
            an 8/4-of-12 grid split, matching the mockup's bento proportions. */}
        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-12 sm:items-start">
          <div className="relative w-full rounded-[16px] border border-line bg-surface p-6 sm:col-span-8">
            <CardEditButton onClick={() => setShowEditMission(true)} label="Edit mission & current focus" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <span className={CARD_TAG}>Mission</span>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                  {draft.mission || <span className="italic text-muted-2">No mission yet.</span>}
                </p>
              </div>
              <div>
                <span className={CARD_TAG}>Current focus</span>
                {currentFocusItems.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {currentFocusItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13.5px] text-fg">
                        <span className="mt-[3px] flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-sea text-[10px] text-slate">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13.5px] italic text-muted-2">No items yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-full rounded-[16px] border border-line bg-surface p-6 sm:col-span-4">
            <CardEditButton onClick={() => setShowEditWorkspace(true)} label="Edit workspace" />
            <div className="relative h-[88px] w-full overflow-hidden rounded-[12px]">
              <WorkspaceIllustration className="h-full w-full" />
              {draft.location && (
                <span className="absolute right-3 top-3 rounded-full bg-slate/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-oatmeal backdrop-blur-sm">
                  {draft.location}
                </span>
              )}
            </div>
            <span className={`${CARD_TAG} mt-4 block`}>Workspace</span>
            {gearItems.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {gearItems.map((item, i) => (
                  <span key={i} className="text-[13px] text-muted">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[13px] italic text-muted-2">No gear added yet.</p>
            )}
          </div>
        </div>

        {/* Productivity Stack, AI Workspace, Building — always render on the
            dashboard (owner-only), each an equal third (4/12) so Building
            lines up under Workspace above it. */}
        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-12 sm:items-start">
          <StackCard
            label="Productivity Stack"
            items={productivityItems}
            colSpanClassName="sm:col-span-4"
            editButton={
              <CardEditButton onClick={() => setShowEditProductivityStack(true)} label="Edit productivity stack" />
            }
          />
          <StackCard
            label="AI Workspace"
            items={aiWorkspaceItems}
            colSpanClassName="sm:col-span-4"
            editButton={
              <CardEditButton onClick={() => setShowEditAiWorkspace(true)} label="Edit AI workspace" />
            }
          />
          <BuildingCard
            items={buildingItems}
            colSpanClassName="sm:col-span-4"
            editButton={<CardEditButton onClick={() => setShowEditBuilding(true)} label="Edit building" />}
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between rounded-[14px] border border-line bg-surface px-5 py-4">
          <div>
            <p className="text-[13.5px] font-medium text-fg">
              {isPublished ? "Published" : "Not published yet"}
            </p>
            <p className="text-[12px] text-muted-2">
              {hasChanges ? "You have unpublished changes." : "Draft matches your live shelf."}
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishStatus === "publishing" || !hasChanges}
            className="rounded-[10px] bg-accent px-4 py-[9px] text-[14px] font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {publishStatus === "publishing" ? "Publishing…" : "Publish"}
          </button>
        </div>
        {error && <p className="mt-2 text-[13px] text-coral-text">{error}</p>}

        <div className="mt-6 flex items-center gap-4 text-[13px]">
          <a href={liveUrl} target="_blank" rel="noreferrer" className="text-sea-deep hover:underline">View your live shelf &rarr;</a>
          <button onClick={signOut} className="text-muted hover:text-fg">
            Log out
          </button>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          userId={userId}
          initial={draft}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showEditMission && (
        <EditMissionModal
          userId={userId}
          initial={{ mission: draft.mission, sections: draft.sections }}
          onClose={() => setShowEditMission(false)}
        />
      )}
      {showEditWorkspace && (
        <EditWorkspaceModal
          userId={userId}
          initial={{ sections: draft.sections }}
          onClose={() => setShowEditWorkspace(false)}
        />
      )}
      {showEditProductivityStack && (
        <EditStackModal
          userId={userId}
          sectionType="productivity_stack"
          title="Edit productivity stack"
          namePlaceholder="Tool name"
          initial={{ sections: draft.sections }}
          onClose={() => setShowEditProductivityStack(false)}
        />
      )}
      {showEditAiWorkspace && (
        <EditStackModal
          userId={userId}
          sectionType="ai_workspace"
          title="Edit AI workspace"
          namePlaceholder="Tool name"
          initial={{ sections: draft.sections }}
          onClose={() => setShowEditAiWorkspace(false)}
        />
      )}
      {showEditBuilding && (
        <EditBuildingModal
          userId={userId}
          initial={{ sections: draft.sections }}
          onClose={() => setShowEditBuilding(false)}
        />
      )}
    </div>
  );
}
