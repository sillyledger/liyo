"use client";

import { useState } from "react";
import { ItemLogo } from "@/components/item-logo";
import { Modal } from "@/components/dashboard/modal";
import type { BuildingItem } from "@/lib/sections";

interface BuildingListProps {
  items: BuildingItem[];
  emptyLabel?: string;
}

const VISIBLE_COUNT = 3;

/**
 * Building's items-or-empty-state + "show 3 inline, View all N" overflow
 * modal — no card wrapper or label, so it can sit inside another card's
 * column (the Mission/Building card) as well as stand alone if reused
 * elsewhere later.
 */
export function BuildingList({ items, emptyLabel = "Nothing yet." }: BuildingListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-col gap-3">
          {visible.map((item, i) => (
            <BuildingRow key={i} item={item} />
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
        <Modal title="Building" onClose={() => setShowAll(false)}>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {items.map((item, i) => (
              <BuildingRow key={i} item={item} />
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function BuildingRow({ item }: { item: BuildingItem }) {
  const inner = (
    <>
      <ItemLogo name={item.name} url={item.url} className="h-9 w-9" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${
              item.status === "live" ? "bg-sea-deep" : "bg-chartreuse"
            }`}
            aria-label={item.status === "live" ? "Live" : "In progress"}
          />
          <p className="truncate text-[13.5px] font-medium text-fg">{item.name}</p>
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-[11.5px] text-muted-2">{item.description}</p>
        )}
      </div>
    </>
  );

  if (item.url) {
    const href = item.url.startsWith("http") ? item.url : `https://${item.url}`;
    return <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3">{inner}</a>;
  }

  return <div className="flex items-center gap-3">{inner}</div>;
}
