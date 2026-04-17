const placeholderColumns = ["Pending", "In Progress", "Completed"] as const;

export function BoardSkeleton() {
  return (
    <section className="flex w-full flex-1 flex-col gap-6">
      <div className="glass-panel grain-overlay rounded-[2rem] p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded-full bg-white/70" />
            <div className="h-10 w-72 rounded-full bg-white/80" />
            <div className="h-5 w-full max-w-2xl rounded-full bg-white/60" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-[1.5rem] bg-white/65"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded-full bg-white/70" />
            <div className="h-11 w-full rounded-2xl bg-white/65" />
            <div className="h-32 w-full rounded-[1.5rem] bg-white/65" />
            <div className="h-11 w-full rounded-full bg-white/75" />
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="h-11 flex-1 rounded-full bg-white/70" />
              <div className="h-11 w-full rounded-full bg-white/70 md:w-44" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {placeholderColumns.map((label) => (
                <div
                  key={label}
                  className="panel-strong rounded-[1.75rem] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-5 w-28 rounded-full bg-stone-200" />
                    <div className="h-6 w-10 rounded-full bg-stone-200" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-28 rounded-[1.25rem] bg-stone-100"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
