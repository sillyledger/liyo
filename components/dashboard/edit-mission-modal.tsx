"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";

interface EditMissionModalProps {
  userId: string;
  initial: {
    mission: string | null;
  };
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[10px] border border-line-2 bg-bg px-4 py-[10px] text-[14px] text-fg outline-none focus:border-accent";
const labelClass = "block text-[12.5px] font-medium text-muted";
const MAX_MISSION_LENGTH = 400;

export function EditMissionModal({ userId, initial, onClose }: EditMissionModalProps) {
  const router = useRouter();
  const [mission, setMission] = useState(initial.mission ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const missionNearLimit = mission.length >= MAX_MISSION_LENGTH - 40;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profile_drafts")
      .update({
        mission: mission || null,
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

  return (
    <Modal title="Edit mission" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass}>Mission</label>
            <span className={`text-[11.5px] ${missionNearLimit ? "text-warm" : "text-muted-2"}`}>
              {mission.length}/{MAX_MISSION_LENGTH}
            </span>
          </div>
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            maxLength={MAX_MISSION_LENGTH}
            placeholder="What you're here to build, longer-form"
          />
        </div>

        {error && <p className="text-[13px] text-warm">{error}</p>}

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
