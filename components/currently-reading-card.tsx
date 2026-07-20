"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/components/dashboard/modal";
import { CARD_TAG } from "@/lib/styles";
import type { CurrentlyReadingItem } from "@/lib/sections";

interface CurrentlyReadingCardProps {
  items: CurrentlyReadingItem[];
  colSpanClassName: string;
  editButton?: ReactNode;
}

const VISIBLE_COUNT = 3;

export function CurrentlyReadingCard({ items, colSpanClassName, editButton }: CurrentlyReadingCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <div className={`relative w-full rounded-[16px] border border-line bg-surface p-6 ${colSpanClassName}`}>
      {editButton}
      <span className={CARD_TAG}>Currently Reading</span>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {visible.map((item, i) => (
            <BookRow key={i} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13.5px] italic text-muted-2">No books yet.</p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-[12.5px] font-medium text-sea-deep hover:underline"
        >
          View all {items.length}
        </button>
      )}

      {showAll && (
        <Modal title="Currently Reading" onClose={() => setShowAll(false)}>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {items.map((item, i) => (
              <BookRow key={i} item={item} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function BookRow({ item }: { item: CurrentlyReadingItem }) {
  return (
    <div className="flex items-center gap-3">
      {item.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover_url}
          alt=""
          className="h-12 w-9 flex-shrink-0 rounded-[4px] border border-line-2 object-cover"
        />
      ) : (
        <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-[4px] border border-line-2 bg-gradient-to-br from-coral to-coral-deep font-mono text-[11px] text-coral-text">
          {(item.title || "?").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-fg">{item.title}</p>
        {item.author && <p className="truncate text-[11.5px] text-muted-2">{item.author}</p>}
      </div>
    </div>
  );
}
