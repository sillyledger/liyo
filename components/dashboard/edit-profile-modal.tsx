"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";

interface EditProfileModalProps {
  userId: string;
  initial: {
    name: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatar_url: string | null;
  };
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[10px] border border-line-2 bg-bg px-4 py-[10px] text-[14px] text-fg outline-none focus:border-accent";
const labelClass = "mb-1.5 block text-[12.5px] font-medium text-muted";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

export function EditProfileModal({ userId, initial, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 2MB or smaller.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploading(false);
      setAvatarError(uploadErr.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profile_drafts")
      .update({
        name: name || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    router.refresh();
    onClose();
  }

  const initialLetter = (name || "?").charAt(0).toUpperCase();

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-2 bg-gradient-to-br from-surface-2 to-bg font-mono text-[13px] text-muted">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              initialLetter
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-[9px] border border-line-2 px-3 py-[7px] text-[13px] font-medium text-fg hover:border-fg">
              {uploading ? "Uploading…" : "Change photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="mt-1.5 text-[11.5px] text-muted-2">JPG or PNG, up to 2MB.</p>
            {avatarError && <p className="mt-1 text-[12.5px] text-coral-text">{avatarError}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What you're building, in a sentence or two"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Taipei, Taiwan"
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              className={inputClass}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="you.com"
            />
          </div>
        </div>

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
            disabled={status === "saving" || uploading}
            className="rounded-[10px] bg-accent px-4 py-[9px] text-[14px] font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
