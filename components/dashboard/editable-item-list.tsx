"use client";

interface EditableItemListProps {
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  placeholder: string;
  itemMaxLength?: number;
}

const rowInputClass =
  "w-full rounded-[9px] border border-line-2 bg-bg px-3 py-[8px] text-[13.5px] text-fg outline-none focus:border-accent";

export function EditableItemList({
  items,
  onChange,
  max,
  placeholder,
  itemMaxLength = 60,
}: EditableItemListProps) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    if (items.length >= max) return;
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className={rowInputClass}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            maxLength={itemMaxLength}
            placeholder={placeholder}
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
      {items.length < max && (
        <button
          type="button"
          onClick={addItem}
          className="mt-1 self-start rounded-[9px] border border-line-2 px-3 py-[6px] text-[12.5px] font-medium text-fg hover:border-fg"
        >
          + Add
        </button>
      )}
      <p className="text-[11.5px] text-muted-2">
        {items.length}/{max}
      </p>
    </div>
  );
}
