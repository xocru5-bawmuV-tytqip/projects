import { BoardSkeleton } from "@/components/board-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <BoardSkeleton />
    </main>
  );
}
