import type { DragEvent } from "react";

import {
  COLUMN_META,
  formatTaskTimestamp,
  getNextStatus,
  getPreviousStatus,
  type TaskCard as TaskCardModel,
} from "@/lib/kanban";

type TaskCardProps = {
  card: TaskCardModel;
  isDragging: boolean;
  onDelete: (card: TaskCardModel) => void;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, card: TaskCardModel) => void;
  onEdit: (card: TaskCardModel) => void;
  onMove: (card: TaskCardModel, targetStatus: TaskCardModel["status"]) => void;
};

export function TaskCard({
  card,
  isDragging,
  onDelete,
  onDragEnd,
  onDragStart,
  onEdit,
  onMove,
}: TaskCardProps) {
  const meta = COLUMN_META[card.status];
  const previousStatus = getPreviousStatus(card.status);
  const nextStatus = getNextStatus(card.status);

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, card)}
      onDragEnd={onDragEnd}
      className="panel-strong flex cursor-grab flex-col gap-4 rounded-[1.4rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing"
      style={{
        borderColor: `${meta.accent}33`,
        opacity: isDragging ? 0.45 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span
            className="inline-flex rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{
              backgroundColor: `${meta.accent}18`,
              color: meta.accent,
            }}
          >
            {meta.label}
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-balance">
            {card.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onDelete(card)}
          className="inline-flex h-9 items-center justify-center rounded-full border border-stone-300 px-3 text-sm font-medium text-stone-700 transition hover:border-[color:var(--status-danger)] hover:text-[color:var(--status-danger)]"
          aria-label={`Delete ${card.title}`}
        >
          Delete
        </button>
      </div>

      <p className="text-sm leading-6 text-[color:var(--muted)]">
        {card.description || "No description added yet."}
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => onEdit(card)}
          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-3 py-2 font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Edit
        </button>

        {previousStatus ? (
          <button
            type="button"
            onClick={() => onMove(card, previousStatus)}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-3 py-2 font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Move back
          </button>
        ) : null}

        {nextStatus ? (
          <button
            type="button"
            onClick={() => onMove(card, nextStatus)}
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-3 py-2 font-medium text-white transition hover:bg-stone-800"
          >
            Move forward
          </button>
        ) : null}
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        Updated {formatTaskTimestamp(card.updatedAt)}
      </p>
    </article>
  );
}
