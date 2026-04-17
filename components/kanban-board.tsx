"use client";

import type { DragEvent, FormEvent } from "react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useOptimistic,
  useState,
} from "react";

import {
  COLUMN_META,
  COLUMN_ORDER,
  STORAGE_KEY,
  createEmptyDraft,
  createTaskFromDraft,
  normalizeDraft,
  parseStoredTasks,
  type StatusFilter,
  type TaskCard,
  type TaskDraft,
  type TaskStatus,
} from "@/lib/kanban";

import { BoardSkeleton } from "./board-skeleton";
import { CardForm } from "./card-form";
import { KanbanColumn } from "./kanban-column";

type BoardAction =
  | { type: "create"; task: TaskCard }
  | { type: "move"; id: string; status: TaskStatus; updatedAt: string }
  | { type: "update"; draft: TaskDraft; id: string; updatedAt: string }
  | { type: "delete"; id: string };

function reduceTasks(tasks: TaskCard[], action: BoardAction): TaskCard[] {
  switch (action.type) {
    case "create":
      return [action.task, ...tasks];
    case "update":
      return tasks.map((task) =>
        task.id === action.id
          ? {
              ...task,
              title: action.draft.title,
              description: action.draft.description,
              updatedAt: action.updatedAt,
            }
          : task,
      );
    case "move": {
      const currentTask = tasks.find((task) => task.id === action.id);

      if (!currentTask || currentTask.status === action.status) {
        return tasks;
      }

      const updatedTask = {
        ...currentTask,
        status: action.status,
        updatedAt: action.updatedAt,
      };

      return [updatedTask, ...tasks.filter((task) => task.id !== action.id)];
    }
    case "delete":
      return tasks.filter((task) => task.id !== action.id);
    default:
      return tasks;
  }
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [draft, setDraft] = useState<TaskDraft>(createEmptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [optimisticTasks, applyOptimisticUpdate] = useOptimistic(
    tasks,
    (currentTasks, action: BoardAction) => reduceTasks(currentTasks, action),
  );

  const persistTasks = useEffectEvent((nextTasks: TaskCard[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
      setStorageError(null);
    } catch {
      setStorageError(
        "Automatic saving is unavailable in this browser session. The UI still works, but refreshes will reset the board.",
      );
    }
  });

  useEffect(() => {
    try {
      const rawTasks = window.localStorage.getItem(STORAGE_KEY);

      if (!rawTasks) {
        setTasks([]);
      } else {
        const parsedTasks = parseStoredTasks(rawTasks);

        if (parsedTasks) {
          setTasks(parsedTasks);
        } else {
          setTasks([]);
          setStorageError(
            "Saved board data was unreadable, so a fresh board was loaded.",
          );
        }
      }
    } catch {
      setStorageError(
        "The board could not reach local storage, so changes will only last for this tab.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    persistTasks(tasks);
  }, [isReady, tasks]);

  const isEditing = editingId !== null;
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const hasActiveFilters = normalizedQuery.length > 0 || statusFilter !== "all";
  const visibleTasks = optimisticTasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" ? true : task.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : `${task.title} ${task.description}`
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const completedTasks = optimisticTasks.filter(
    (task) => task.status === "completed",
  ).length;

  const commitAction = (action: BoardAction) => {
    applyOptimisticUpdate(action);
    startTransition(() => {
      setTasks((currentTasks) => reduceTasks(currentTasks, action));
    });
  };

  const updateDraft = (field: keyof TaskDraft, value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const resetComposer = () => {
    setDraft(createEmptyDraft());
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDraft = normalizeDraft(draft);

    if (!normalizedDraft.title) {
      return;
    }

    if (isEditing && editingId) {
      commitAction({
        type: "update",
        id: editingId,
        draft: normalizedDraft,
        updatedAt: new Date().toISOString(),
      });
    } else {
      commitAction({
        type: "create",
        task: createTaskFromDraft(normalizedDraft),
      });
    }

    resetComposer();
  };

  const handleEdit = (card: TaskCard) => {
    setEditingId(card.id);
    setDraft({
      title: card.title,
      description: card.description,
    });
  };

  const handleDelete = (card: TaskCard) => {
    const shouldDelete = window.confirm(
      `Delete "${card.title}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    commitAction({
      type: "delete",
      id: card.id,
    });

    if (editingId === card.id) {
      resetComposer();
    }
  };

  const handleMove = (card: TaskCard, targetStatus: TaskStatus) => {
    if (card.status === targetStatus) {
      return;
    }

    commitAction({
      type: "move",
      id: card.id,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, card: TaskCard) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
    setDraggingCardId(card.id);
  };

  const clearDragState = () => {
    setDraggingCardId(null);
    setDropTarget(null);
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    const activeCard = optimisticTasks.find((task) => task.id === draggingCardId);

    if (activeCard) {
      handleMove(activeCard, targetStatus);
    }

    clearDragState();
  };

  if (!isReady) {
    return <BoardSkeleton />;
  }

  return (
    <section className="flex w-full flex-1 flex-col gap-6">
      <div className="glass-panel grain-overlay overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="relative space-y-6">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-2 font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">
              Next.js Intern Assignment
            </span>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Mini Kanban Board
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                A local-first workflow board with create, edit, delete,
                confirmation, search, filter, optimistic updates, and drag and
                drop across Pending, In Progress, and Completed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel-strong rounded-[1.6rem] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Total cards
              </p>
              <p className="mt-3 text-3xl font-semibold">{optimisticTasks.length}</p>
            </div>
            <div className="panel-strong rounded-[1.6rem] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Completed
              </p>
              <p className="mt-3 text-3xl font-semibold">{completedTasks}</p>
            </div>
            <div className="panel-strong rounded-[1.6rem] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Storage
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                {storageError ??
                  "Changes sync automatically to browser storage so refreshes keep your board intact."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <CardForm
          draft={draft}
          isEditing={isEditing}
          totalTasks={optimisticTasks.length}
          completedTasks={completedTasks}
          onCancelEdit={resetComposer}
          onChange={updateDraft}
          onSubmit={handleSubmit}
        />

        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="flex-1">
                <span className="sr-only">Search cards</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title or description"
                  className="panel-strong w-full rounded-full px-4 py-3 outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[color:var(--color-accent-soft)]"
                />
              </label>

              <label className="lg:w-48">
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="panel-strong w-full rounded-full px-4 py-3 outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[color:var(--color-accent-soft)]"
                >
                  <option value="all">All stages</option>
                  {COLUMN_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {COLUMN_META[status].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-2 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {visibleTasks.length} of {optimisticTasks.length} cards
                {hasActiveFilters ? " with the current filters." : "."}
              </p>
              <p>Drag cards between columns or use the move buttons inside each card.</p>
            </div>

            {hasActiveFilters && visibleTasks.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-stone-300 bg-white/55 px-4 py-5 text-sm leading-6 text-[color:var(--muted)]">
                Nothing matched the current search or stage filter. Try a
                broader query or switch back to All stages.
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-3">
              {COLUMN_ORDER.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  cards={visibleTasks.filter((task) => task.status === status)}
                  draggingCardId={draggingCardId}
                  dropTarget={dropTarget}
                  hasActiveFilters={hasActiveFilters}
                  onDelete={handleDelete}
                  onDragEnd={clearDragState}
                  onDragOver={setDropTarget}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onEdit={handleEdit}
                  onMove={handleMove}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
