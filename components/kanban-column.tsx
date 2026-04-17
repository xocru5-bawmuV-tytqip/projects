import type { DragEvent } from "react";

import { COLUMN_META, type TaskCard, type TaskStatus } from "@/lib/kanban";

import { TaskCard as TaskCardView } from "./task-card";

type KanbanColumnProps = {
  cards: TaskCard[];
  draggingCardId: string | null;
  dropTarget: TaskStatus | null;
  hasActiveFilters: boolean;
  status: TaskStatus;
  onDelete: (card: TaskCard) => void;
  onDragEnd: () => void;
  onDragOver: (status: TaskStatus) => void;
  onDragStart: (event: DragEvent<HTMLElement>, card: TaskCard) => void;
  onDrop: (status: TaskStatus) => void;
  onEdit: (card: TaskCard) => void;
  onMove: (card: TaskCard, targetStatus: TaskStatus) => void;
};

export function KanbanColumn({
  cards,
  draggingCardId,
  dropTarget,
  hasActiveFilters,
  status,
  onDelete,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onEdit,
  onMove,
}: KanbanColumnProps) {
  const meta = COLUMN_META[status];
  const isDropTarget = dropTarget === status;

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(status);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(status);
      }}
      className="panel-strong flex min-h-[28rem] flex-col rounded-[1.75rem] border p-4 transition"
      style={{
        borderColor: isDropTarget ? meta.accent : undefined,
        backgroundColor: isDropTarget ? `${meta.accent}10` : undefined,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{meta.label}</h2>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {meta.helper}
          </p>
        </div>

        <span
          className="inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 font-mono text-sm"
          style={{
            backgroundColor: `${meta.accent}14`,
            color: meta.accent,
          }}
        >
          {cards.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {cards.length > 0 ? (
          cards.map((card) => (
            <TaskCardView
              key={card.id}
              card={card}
              isDragging={draggingCardId === card.id}
              onDelete={onDelete}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onEdit={onEdit}
              onMove={onMove}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-stone-300 bg-white/50 p-6 text-center text-sm leading-6 text-[color:var(--muted)]">
            {hasActiveFilters
              ? "No cards match the current search or filter in this column."
              : "Nothing here yet. Create a card or drag one into this stage."}
          </div>
        )}
      </div>
    </section>
  );
}
