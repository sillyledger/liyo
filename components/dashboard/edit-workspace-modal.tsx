"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { EditableItemList } from "./editable-item-list";
import { WORKSPACE_GEAR_MAX_ITEMS, getSectionItems, upsertSection, type SectionBlock } from "@/lib/sections";

interface EditWorkspaceModalProps {
  userId: string;
  initial: {
    sections: SectionBlock[];
  };
  onClose: () => void;
}

export function EditWorkspaceModal({ userId, initial, onClose }: EditWorkspaceModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(getSectionItems(initial.sections, "workspace_gear"));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanItems = items.map((item) => item.trim()).filter(Boolean);
    const nextSections = upsertSection(initial.sections, {
      type: "workspace_gear",
      items: cleanItems,
    });

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profile_drafts")
      .update({
        sections: nextSections,
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
    <Modal title="Edit workspace" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-muted">Gear</label>
          <EditableItemList
            items={items}
            onChange={setItems}
            max={WORKSPACE_GEAR_MAX_ITEMS}
            placeholder="e.g. Keychron Q1"
            itemMaxLength={60}
          />
        </div>

        <p className="text-[12px] text-muted-2">
          The city badge on this card uses your Location from Edit profile — update it there.
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
