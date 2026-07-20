"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { extractSpotifyPlaylistId } from "@/lib/spotify";

interface EditPlaylistModalProps {
  userId: string;
  initial: { playlist_url: string | null };
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[9px] border border-line-2 bg-bg px-3 py-[8px] text-[13.5px] text-fg outline-none focus:border-accent";

export function EditPlaylistModal({ userId, initial, onClose }: EditPlaylistModalProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initial.playlist_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (trimmed && !extractSpotifyPlaylistId(trimmed)) {
      setError("That doesn't look like a Spotify playlist link.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profile_drafts")
      .update({ playlist_url: trimmed || null, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <Modal title="Edit playlist for work" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className={inputClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
        />

        <p className="text-[12px] text-muted-2">
          Paste a public Spotify playlist link — it&apos;s embedded with Spotify&apos;s own player, no track entry needed.
        </p>

        {error && <p className="text-[13px] text-coral-text">{error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line-2 px-4 py-[9px] text-[14px] font-medium text-fg hover:border-fg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-[10px] bg-accent px-4 py-[9px] text-[14px] font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
