"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

export function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Sleep om te verplaatsen"
        className="flex w-6 shrink-0 cursor-grab touch-none items-center justify-center text-neutral-400 active:cursor-grabbing"
      >
        ⠿
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}
