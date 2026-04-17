export const COLUMN_ORDER = ["pending", "in-progress", "completed"] as const;

export type TaskStatus = (typeof COLUMN_ORDER)[number];
export type StatusFilter = TaskStatus | "all";

export type TaskDraft = {
  title: string;
  description: string;
};

export type TaskCard = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export const STORAGE_KEY = "mini-kanban-board:v1";

export const COLUMN_META: Record<
  TaskStatus,
  { label: string; helper: string; accent: string }
> = {
  pending: {
    label: "Pending",
    helper: "Fresh work that is queued and ready to start.",
    accent: "#dd8b41",
  },
  "in-progress": {
    label: "In Progress",
    helper: "Tasks that are actively being worked on right now.",
    accent: "#2f78c8",
  },
  completed: {
    label: "Completed",
    helper: "Finished work waiting for a quick victory lap.",
    accent: "#2f8b5f",
  },
};

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function createEmptyDraft(): TaskDraft {
  return {
    title: "",
    description: "",
  };
}

export function normalizeDraft(draft: TaskDraft): TaskDraft {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
  };
}

export function createTaskFromDraft(
  draft: TaskDraft,
  createdAt = new Date().toISOString(),
): TaskCard {
  const normalized = normalizeDraft(draft);

  return {
    id: crypto.randomUUID(),
    title: normalized.title,
    description: normalized.description,
    status: "pending",
    createdAt,
    updatedAt: createdAt,
  };
}

export function parseStoredTasks(raw: string): TaskCard[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const tasks = parsed.map((task) => sanitizeTask(task));

    return tasks.every(Boolean) ? (tasks as TaskCard[]) : null;
  } catch {
    return null;
  }
}

export function getPreviousStatus(status: TaskStatus): TaskStatus | null {
  const currentIndex = COLUMN_ORDER.indexOf(status);

  if (currentIndex <= 0) {
    return null;
  }

  return COLUMN_ORDER[currentIndex - 1];
}

export function getNextStatus(status: TaskStatus): TaskStatus | null {
  const currentIndex = COLUMN_ORDER.indexOf(status);

  if (currentIndex === -1 || currentIndex === COLUMN_ORDER.length - 1) {
    return null;
  }

  return COLUMN_ORDER[currentIndex + 1];
}

export function formatTaskTimestamp(timestamp: string): string {
  return timestampFormatter.format(new Date(timestamp));
}

function sanitizeTask(value: unknown): TaskCard | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TaskCard>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string" ||
    !COLUMN_ORDER.includes(candidate.status as TaskStatus)
  ) {
    return null;
  }

  const normalized = normalizeDraft({
    title: candidate.title,
    description: candidate.description,
  });

  if (!normalized.title) {
    return null;
  }

  return {
    id: candidate.id,
    title: normalized.title,
    description: normalized.description,
    status: candidate.status as TaskStatus,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}
