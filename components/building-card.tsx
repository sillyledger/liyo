"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ItemLogo } from "@/components/item-logo";
import { Modal } from "@/components/dashboard/modal";
import { CARD_TAG } from "@/lib/styles";
import type { BuildingItem } from "@/lib/sections";

interface BuildingCardProps {
  items: BuildingItem[];
  colSpanClassName: string;
  editButton?: ReactNode;
}

const VISIBLE_COUNT = 3;

export function BuildingCard({ items, colSpanClassName, editButton }: BuildingCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <div className={`relative w-full rounded-[16px] border border-line bg-surface p-6 ${colSpanClassName}`}>
      {editButton}
      <span className={CARD_TAG}>Building</span>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {visible.map((item, i) => (
            <BuildingRow key={i} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13.5px] italic text-muted-2">Nothing yet.</p>
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
    </div>
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
