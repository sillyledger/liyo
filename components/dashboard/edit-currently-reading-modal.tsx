"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { getSection, upsertSection, type SectionBlock, type CurrentlyReadingItem } from "@/lib/sections";

interface EditCurrentlyReadingModalProps {
  userId: string;
  initial: {
    sections: SectionBlock[];
  };
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[9px] border border-line-2 bg-bg px-3 py-[8px] text-[13.5px] text-fg outline-none focus:border-accent";

export function EditCurrentlyReadingModal({ userId, initial, onClose }: EditCurrentlyReadingModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<CurrentlyReadingItem[]>(
    getSection(initial.sections, "currently_reading")?.items ?? []
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<CurrentlyReadingItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { title: "", author: "", cover_url: null }]);
  }

  // Open Library cover lookup is temporarily disabled — deferred, not
  // abandoned. It wasn't reliably returning covers and isn't worth
  // further debugging right now, so there's no lookup call here anymore
  // (previously fired on blur of the title/author inputs). Currently
  // Reading shows a "Coming soon" placeholder for every book instead
  // (components/currently-reading-card.tsx); title/author still save
  // and display normally. The lookup logic itself is untouched in
  // lib/openlibrary.ts and the route (app/api/book-cover/route.ts, now
  // commented out) if this ever gets revisited.

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanItems = items
      .map((item) => ({
        title: item.title.trim(),
        author: item.author.trim(),
        cover_url: item.cover_url,
      }))
      .filter((item) => item.title);

    const nextSections = upsertSection(initial.sections, {
      type: "currently_reading",
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
    <Modal title="Edit currently reading" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Book title"
              />
              <input
                className={inputClass}
                value={item.author}
                onChange={(e) => updateItem(index, { author: e.target.value })}
                placeholder="Author"
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
          Cover art is coming soon — every book shows a placeholder for now.
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
