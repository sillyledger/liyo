"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { getSection, upsertSection, type SectionBlock, type StackItem } from "@/lib/sections";

type StackSectionType = "productivity_stack" | "ai_workspace" | "preferred_starter_stack";

interface EditStackModalProps {
  userId: string;
  sectionType: StackSectionType;
  title: string;
  namePlaceholder: string;
  initial: {
    sections: SectionBlock[];
  };
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[9px] border border-line-2 bg-bg px-3 py-[8px] text-[13.5px] text-fg outline-none focus:border-accent";

/** Shared editor for Productivity Stack, AI Workspace, and Preferred Starter Stack — identical item shape, no cap on count. */
export function EditStackModal({
  userId,
  sectionType,
  title,
  namePlaceholder,
  initial,
  onClose,
}: EditStackModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<StackItem[]>(
    getSection(initial.sections, sectionType)?.items ?? []
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<StackItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", url: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanItems = items
      .map((item) => ({ name: item.name.trim(), url: item.url?.trim() || null }))
      .filter((item) => item.name);

    const nextSections = upsertSection(initial.sections, {
      type: sectionType,
      items: cleanItems,
    });

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profile_drafts")
      .update({ sections: nextSections, updated_at: new Date().toISOString() })
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
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className={inputClass}
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                placeholder={namePlaceholder}
              />
              <input
                className={inputClass}
                value={item.url ?? ""}
                onChange={(e) => updateItem(index, { url: e.target.value })}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="Remove item"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-1 self-start rounded-[9px] border border-line-2 px-3 py-[6px] text-[12.5px] font-medium text-fg hover:border-fg"
          >
            + Add
          </button>
        </div>

        <p className="text-[12px] text-muted-2">
          The logo is fetched automatically from the URL's domain — no upload needed.
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
