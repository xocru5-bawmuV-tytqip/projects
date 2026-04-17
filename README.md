# Mini Kanban Board

A polished Kanban board built for the assignment requirements with Next.js App Router, React functional components, Tailwind CSS, and TypeScript.

## Features

- Create cards with title and description
- New cards start in the `Pending` column
- View cards across `Pending`, `In Progress`, and `Completed`
- Move cards with drag and drop or inline move buttons
- Edit existing card title and description
- Delete cards with confirmation
- Search cards by title or description
- Filter cards by stage
- Persist board state in browser `localStorage`
- Loading and empty states for a smoother UX
- Optimistic updates for fast-feeling interactions

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- TypeScript

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Project Structure

```text
app/
  layout.tsx
  loading.tsx
  page.tsx
components/
  board-skeleton.tsx
  card-form.tsx
  kanban-board.tsx
  kanban-column.tsx
  task-card.tsx
lib/
  kanban.ts
```

## Notes

- The board is local-first and does not require a backend.
- Server and client responsibilities are split cleanly: the route shell lives in `app/`, while the interactive board experience lives in client components.
- Deployment and GitHub push steps were intentionally left out for this handoff.
