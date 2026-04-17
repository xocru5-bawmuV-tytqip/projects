import type { FormEvent } from "react";

import type { TaskDraft } from "@/lib/kanban";

type CardFormProps = {
  draft: TaskDraft;
  isEditing: boolean;
  totalTasks: number;
  completedTasks: number;
  onCancelEdit: () => void;
  onChange: (field: keyof TaskDraft, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CardForm({
  draft,
  isEditing,
  totalTasks,
  completedTasks,
  onCancelEdit,
  onChange,
  onSubmit,
}: CardFormProps) {
  const titleCount = draft.title.trim().length;
  const descriptionCount = draft.description.trim().length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <aside className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">
            Board Controls
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            {isEditing ? "Update selected card" : "Create a new card"}
          </h2>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            New cards always land in the Pending column, then you can move them
            forward with buttons or drag and drop.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="panel-strong rounded-[1.5rem] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Cards tracked
            </p>
            <p className="mt-2 text-3xl font-semibold">{totalTasks}</p>
          </div>
          <div className="panel-strong rounded-[1.5rem] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Completion
            </p>
            <p className="mt-2 text-3xl font-semibold">{completionRate}%</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Title</span>
            <input
              value={draft.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Ship homepage polish"
              className="panel-strong w-full rounded-[1.25rem] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[color:var(--color-accent-soft)]"
              maxLength={80}
              required
            />
            <span className="block text-xs text-[color:var(--muted)]">
              {titleCount}/80 characters
            </span>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Add the context, blockers, or any notes the team should see."
              className="panel-strong min-h-36 w-full rounded-[1.25rem] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[color:var(--color-accent-soft)]"
              maxLength={280}
            />
            <span className="block text-xs text-[color:var(--muted)]">
              {descriptionCount}/280 characters
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 font-medium text-white transition hover:brightness-95"
            >
              {isEditing ? "Save changes" : "Add card"}
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="panel-strong rounded-[1.5rem] px-4 py-3 text-sm leading-6 text-[color:var(--muted)]">
          This board saves to browser storage automatically, so refreshes keep
          your latest state without needing a backend.
        </div>
      </div>
    </aside>
  );
}
