"use client";

import { useState } from "react";
import { categoryStyle } from "@/lib/categories";
import { timeToMinutes } from "@/lib/date";
import type { ScheduleItem } from "@/lib/schedule";

// Kaarthoogte schaalt mee met de duur, zodat een 5-minuten micro-pauze en een
// 45-minuten schrijfblok visueel verschillend wegen. Ondergrens houdt korte
// blokken nog leesbaar/aantikbaar; bovengrens voorkomt een onwerkbaar hoog blok.
function cardMinHeight(startMin: number, endMin: number): number {
  const duration = Math.max(endMin - startMin, 0);
  return Math.max(56, Math.min(duration * 1.6, 240));
}

type BlockPatch = { start?: string; end?: string; taskText?: string | null; label?: string; removed?: boolean };
type AppointmentPatch = { title?: string; startTime?: string; endTime?: string; notes?: string | null };

export function ItemCard({
  item,
  onSaveBlock,
  onSaveAppointment,
  onDeleteAppointment,
}: {
  item: ScheduleItem;
  onSaveBlock: (blockId: string, patch: BlockPatch) => Promise<void>;
  onSaveAppointment: (id: string, patch: AppointmentPatch) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(item.start);
  const [end, setEnd] = useState(item.end);
  const [taskText, setTaskText] = useState(item.taskText ?? "");
  const [title, setTitle] = useState(item.label);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      if (item.kind === "block") {
        // Tijd/titel alleen meesturen als die daadwerkelijk gewijzigd zijn: anders bevriest een
        // simpele taak-notitie het blok op de huidige tijd en volgt het niet langer de wektijd.
        const patch: BlockPatch = { taskText: taskText || null };
        if (start !== item.start) patch.start = start;
        if (end !== item.end) patch.end = end;
        if (title !== item.label) patch.label = title;
        await onSaveBlock(item.sourceBlockId!, patch);
      } else {
        await onSaveAppointment(item.id, { title, startTime: start, endTime: end, notes: notes || null });
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      if (item.kind === "block") {
        await onSaveBlock(item.sourceBlockId!, { removed: true });
      } else {
        await onDeleteAppointment(item.id);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`flex flex-col justify-center rounded border-l-4 p-3 ${categoryStyle(item.category)}`}
      style={{ minHeight: cardMinHeight(timeToMinutes(item.start), timeToMinutes(item.end)) }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs tabular-nums text-neutral-500">
            {item.start}–{item.end}
          </div>
          <div className="font-medium">{item.label}</div>
          {item.taskText && <div className="text-sm text-neutral-600 dark:text-neutral-300">{item.taskText}</div>}
          {item.notes && <div className="text-sm text-neutral-600 dark:text-neutral-300">{item.notes}</div>}
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded px-2 py-1 text-sm text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          {editing ? "Sluiten" : "Bewerken"}
        </button>
      </div>

      {editing && (
        <div className="mt-3 flex flex-col gap-2 border-t border-black/10 pt-3 dark:border-white/10">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
          </div>
          {item.kind === "block" ? (
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Specifieke taak (optioneel)"
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
          ) : (
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notitie (optioneel)"
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
          )}
          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
            >
              {item.kind === "block" ? "Blok verwijderen" : "Afspraak verwijderen"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              Opslaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
