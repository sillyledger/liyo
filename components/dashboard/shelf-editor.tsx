"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EditProfileModal } from "./edit-profile-modal";

interface ProfileFields {
  name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
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
    a.avatar_url === b.avatar_url
  );
}

export function ShelfEditor({ userId, username, draft, published }: ShelfEditorProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isPublished = published?.published_at != null;
  const hasChanges = !fieldsMatch(draft, published);

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

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (draft.name || username).charAt(0).toUpperCase();

  return (
    <div className="flex w-full max-w-[560px] flex-col items-center">
      <div className="w-full rounded-[16px] border border-line bg-surface p-8">
        <div className="flex items-start justify-between">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-line-2 bg-gradient-to-br from-surface-2 to-bg font-mono text-[14px] text-muted">
            {initial}
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-[9px] border border-line-2 px-3 py-[7px] text-[13px] font-medium text-fg hover:border-fg"
          >
            Edit profile
          </button>
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
        <a href={`https://liyo.dev/${username}`} target="_blank" rel="noreferrer" className="text-sea-deep hover:underline">View your live shelf &rarr;</a>
        <button onClick={signOut} className="text-muted hover:text-fg">
          Log out
        </button>
      </div>

      {showEdit && (
        <EditProfileModal
          userId={userId}
          initial={draft}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
