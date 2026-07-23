"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableRow } from "@/components/SortableRow";
import { ItemCard } from "@/components/ItemCard";
import { DateJumpForm } from "@/components/DateJumpForm";
import {
  PLANNER_END,
  addDays,
  formatDateLong,
  isWithinPlannerRange,
  startOfWeek,
  timeToMinutes,
  minutesToTime,
} from "@/lib/date";
import { computeConflicts, type DaySchedule } from "@/lib/schedule";

async function patchBlockOverride(
  blockId: string,
  date: string,
  patch: { start?: string; end?: string; taskText?: string | null; label?: string; removed?: boolean }
) {
  await fetch(`/api/blocks/${blockId}/override`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, ...patch }),
  });
}

async function restoreBlock(blockId: string, date: string) {
  await fetch(`/api/blocks/${blockId}/override?date=${date}`, { method: "DELETE" });
}

async function patchAppointment(
  id: string,
  patch: { title?: string; startTime?: string; endTime?: string; notes?: string | null }
) {
  await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

async function deleteAppointment(id: string) {
  await fetch(`/api/appointments/${id}`, { method: "DELETE" });
}

async function clearDay(date: string, endDate?: string) {
  await fetch("/api/schedule/day/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, endDate }),
  });
}

export function DayView({ initial }: { initial: DaySchedule }) {
  const [schedule, setSchedule] = useState(initial);
  const [wakeTimeInput, setWakeTimeInput] = useState(initial.wakeTime);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [apptTitle, setApptTitle] = useState("");
  const [apptStart, setApptStart] = useState("18:00");
  const [apptEnd, setApptEnd] = useState("19:00");
  const [showClearRangeForm, setShowClearRangeForm] = useState(false);
  const [clearRangeEnd, setClearRangeEnd] = useState(initial.date);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  async function reload() {
    const res = await fetch(`/api/schedule/day?date=${schedule.date}`);
    const data: DaySchedule = await res.json();
    setSchedule(data);
    setWakeTimeInput(data.wakeTime);
  }

  const activeItems = schedule.items.filter((i) => !i.removed);
  const removedItems = schedule.items.filter((i) => i.removed);
  const conflicts = computeConflicts(activeItems);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeItems.findIndex((i) => `${i.kind}:${i.id}` === active.id);
    const newIndex = activeItems.findIndex((i) => `${i.kind}:${i.id}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activeItems, oldIndex, newIndex);

    // Cascade: vaste-kloktijd items (afspraken, fixedClockTime-blokken) blijven op hun eigen
    // tijd staan; flexibele blokken schuiven na elkaar op in de nieuwe volgorde, zodat er geen
    // overlap ontstaat door het verslepen van één blok.
    let cursor = timeToMinutes(schedule.wakeTime);
    const recomputed = reordered.map((item) => {
      if (item.fixedTime) {
        cursor = Math.max(cursor, timeToMinutes(item.end));
        return item;
      }
      const durationMinutes = Math.max(timeToMinutes(item.end) - timeToMinutes(item.start), 5);
      const newStart = cursor;
      const newEnd = cursor + durationMinutes;
      cursor = newEnd;
      return { ...item, start: minutesToTime(newStart), end: minutesToTime(newEnd) };
    });

    const changed = recomputed.filter((item, i) => {
      const original = reordered[i];
      return item.start !== original.start || item.end !== original.end;
    });

    // Optimistisch bijwerken zodat de lijst niet terugspringt tijdens het opslaan.
    const byKey = new Map(recomputed.map((item) => [`${item.kind}:${item.id}`, item]));
    setSchedule((s) => ({
      ...s,
      items: s.items.map((i) => byKey.get(`${i.kind}:${i.id}`) ?? i),
    }));

    await Promise.all(
      changed.map((item) =>
        item.kind === "block"
          ? patchBlockOverride(item.sourceBlockId!, schedule.date, { start: item.start, end: item.end })
          : patchAppointment(item.id, { startTime: item.start, endTime: item.end })
      )
    );
    await reload();
  }

  async function handleWakeTimeSave() {
    await fetch("/api/day-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: schedule.date, wakeTime: wakeTimeInput }),
    });
    await reload();
  }

  async function handleWakeTimeReset() {
    await fetch("/api/day-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: schedule.date, wakeTime: null }),
    });
    await reload();
  }

  async function handleClearDay() {
    const confirmed = window.confirm(
      "Hele dag leegmaken? Blokken zijn daarna nog herstelbaar, afspraken worden definitief verwijderd."
    );
    if (!confirmed) return;
    await clearDay(schedule.date);
    await reload();
  }

  async function handleClearRange() {
    const endDate = clearRangeEnd > PLANNER_END ? PLANNER_END : clearRangeEnd;
    if (endDate < schedule.date) return;
    const confirmed = window.confirm(
      `Alle dagen van ${schedule.date} t/m ${endDate} leegmaken? Blokken zijn daarna nog per dag herstelbaar, afspraken worden definitief verwijderd.`
    );
    if (!confirmed) return;
    await clearDay(schedule.date, endDate);
    setShowClearRangeForm(false);
    await reload();
  }

  async function handleAddAppointment() {
    if (!apptTitle.trim()) return;
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: schedule.date,
        title: apptTitle,
        startTime: apptStart,
        endTime: apptEnd,
      }),
    });
    setApptTitle("");
    setShowAppointmentForm(false);
    await reload();
  }

  const prevDate = addDays(schedule.date, -1);
  const nextDate = addDays(schedule.date, 1);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <Link
          href={isWithinPlannerRange(prevDate) ? `/day/${prevDate}` : "#"}
          className={`rounded px-2 py-1 text-sm ${
            isWithinPlannerRange(prevDate) ? "hover:bg-black/5 dark:hover:bg-white/10" : "pointer-events-none opacity-30"
          }`}
        >
          ← vorige dag
        </Link>
        <Link href={`/week/${startOfWeek(schedule.date)}`} className="text-sm text-neutral-500 hover:underline">
          weekoverzicht
        </Link>
        <Link
          href={isWithinPlannerRange(nextDate) ? `/day/${nextDate}` : "#"}
          className={`rounded px-2 py-1 text-sm ${
            isWithinPlannerRange(nextDate) ? "hover:bg-black/5 dark:hover:bg-white/10" : "pointer-events-none opacity-30"
          }`}
        >
          volgende dag →
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-neutral-500">Ga naar</span>
        <DateJumpForm currentDate={schedule.date} buildHref={(date) => `/day/${date}`} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">{formatDateLong(schedule.date)}</h1>
        <div className="flex items-center gap-3">
          {activeItems.length > 0 && (
            <button type="button" onClick={handleClearDay} className="text-sm text-red-600 hover:underline">
              dag leegmaken
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowClearRangeForm((v) => !v)}
            className="text-sm text-red-600 hover:underline"
          >
            periode leegmaken
          </button>
        </div>
      </div>

      {showClearRangeForm && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-red-200 p-3 text-sm dark:border-red-900">
          <span className="text-neutral-500">Van {schedule.date} t/m</span>
          <input
            type="date"
            value={clearRangeEnd}
            min={schedule.date}
            max={PLANNER_END}
            onChange={(e) => setClearRangeEnd(e.target.value)}
            className="rounded border border-black/20 px-2 py-1 dark:border-white/20 dark:bg-black"
          />
          <button
            type="button"
            onClick={handleClearRange}
            className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
          >
            Leegmaken
          </button>
          <button
            type="button"
            onClick={() => setShowClearRangeForm(false)}
            className="text-neutral-500 hover:underline"
          >
            Annuleren
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 rounded border border-black/10 p-3 text-sm dark:border-white/10">
        <label htmlFor="wakeTime" className="text-neutral-500">
          Wektijd
        </label>
        <input
          id="wakeTime"
          type="time"
          value={wakeTimeInput}
          onChange={(e) => setWakeTimeInput(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20 dark:bg-black"
        />
        <button
          type="button"
          onClick={handleWakeTimeSave}
          className="rounded bg-black px-2 py-1 text-white dark:bg-white dark:text-black"
        >
          Toepassen
        </button>
        {schedule.wakeTimeIsCustom && (
          <button type="button" onClick={handleWakeTimeReset} className="text-neutral-500 hover:underline">
            standaard
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={activeItems.map((i) => `${i.kind}:${i.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {activeItems.map((item) => (
              <SortableRow key={`${item.kind}:${item.id}`} id={`${item.kind}:${item.id}`}>
                <ItemCard
                  item={item}
                  conflictsWith={conflicts.get(`${item.kind}:${item.id}`)}
                  onSaveBlock={(blockId, patch) => patchBlockOverride(blockId, schedule.date, patch).then(reload)}
                  onSaveAppointment={(id, patch) => patchAppointment(id, patch).then(reload)}
                  onDeleteAppointment={(id) => deleteAppointment(id).then(reload)}
                />
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAppointmentForm ? (
        <div className="flex flex-col gap-2 rounded border border-black/10 p-3 dark:border-white/10">
          <input
            value={apptTitle}
            onChange={(e) => setApptTitle(e.target.value)}
            placeholder="Titel (bv. Seminar)"
            autoFocus
            className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={apptStart}
              onChange={(e) => setApptStart(e.target.value)}
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
            <input
              type="time"
              value={apptEnd}
              onChange={(e) => setApptEnd(e.target.value)}
              className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAppointmentForm(false)}
              className="rounded px-2 py-1 text-sm text-neutral-500"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleAddAppointment}
              className="rounded bg-black px-3 py-1 text-sm text-white dark:bg-white dark:text-black"
            >
              Toevoegen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAppointmentForm(true)}
          className="rounded border border-dashed border-black/20 p-2 text-sm text-neutral-500 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          + Afspraak toevoegen
        </button>
      )}

      {removedItems.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium uppercase text-neutral-400">Verwijderd vandaag</div>
          <div className="flex flex-col gap-2">
            {removedItems.map((item) => (
              <div
                key={`${item.kind}:${item.id}`}
                className="flex items-center justify-between rounded border border-black/10 p-2 text-sm text-neutral-400 dark:border-white/10"
              >
                <span className="line-through">{item.label}</span>
                <button
                  type="button"
                  onClick={() => restoreBlock(item.sourceBlockId!, schedule.date).then(reload)}
                  className="text-neutral-600 hover:underline dark:text-neutral-300"
                >
                  herstel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
