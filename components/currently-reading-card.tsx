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

/**
 * Open Library cover lookup is temporarily disabled — deferred, not
 * abandoned. It wasn't reliably returning covers and isn't worth
 * further debugging right now (see app/api/book-cover/route.ts and
 * lib/openlibrary.ts, both left intact for a future revival). Every
 * book shows this placeholder regardless of any stored `cover_url` —
 * title/author still save and display normally.
 */
function BookCoverPlaceholder() {
  return (
    <div className="flex h-12 w-9 flex-shrink-0 flex-col items-center justify-center rounded-[4px] border border-line-2 bg-gradient-to-br from-coral to-coral-deep px-0.5 text-center text-[7px] font-medium italic leading-[1.15] text-coral-text">
      Coming soon
    </div>
  );
}

function BookRow({ item }: { item: CurrentlyReadingItem }) {
  return (
    <div className="flex items-center gap-3">
      <BookCoverPlaceholder />
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-fg">{item.title}</p>
        {item.author && <p className="truncate text-[11.5px] text-muted-2">{item.author}</p>}
      </div>
    </div>
  );
}
