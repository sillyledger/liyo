"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ItemLogo } from "@/components/item-logo";
import { Modal } from "@/components/dashboard/modal";
import { domainFromUrl } from "@/lib/logo";
import { CARD_TAG } from "@/lib/styles";
import type { StackItem } from "@/lib/sections";

interface StackCardProps {
  label: string;
  items: StackItem[];
  colSpanClassName: string;
  editButton?: ReactNode;
  emptyLabel?: string;
}

const VISIBLE_COUNT = 3;

/** Shared display for Productivity Stack and AI Workspace — identical item shape (name + url). */
export function StackCard({ label, items, colSpanClassName, editButton, emptyLabel = "No items yet." }: StackCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <div className={`relative w-full rounded-[16px] border border-line bg-surface p-6 ${colSpanClassName}`}>
      {editButton}
      <span className={CARD_TAG}>{label}</span>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {visible.map((item, i) => (
            <StackRow key={i} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13.5px] italic text-muted-2">{emptyLabel}</p>
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
        <Modal title={label} onClose={() => setShowAll(false)}>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {items.map((item, i) => (
              <StackRow key={i} item={item} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function StackRow({ item }: { item: StackItem }) {
  const domain = domainFromUrl(item.url);
  const inner = (
    <>
      <ItemLogo name={item.name} url={item.url} className="h-9 w-9" />
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-fg">{item.name}</p>
        {domain && <p className="truncate text-[11.5px] text-muted-2">{domain}</p>}
      </div>
    </>
  );

  if (item.url) {
    const href = item.url.startsWith("http") ? item.url : `https://${item.url}`;
    return <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3">{inner}</a>;
  }

  return <div className="flex items-center gap-3">{inner}</div>;
}
