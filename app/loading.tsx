import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white" aria-hidden="true">
      <div className="h-16 border-b border-blue-700 bg-blue-600">
        <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/90" />
            <div className="h-5 w-24 rounded bg-white/35" />
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <div className="h-4 w-10 rounded bg-white/30" />
            <div className="h-4 w-16 rounded bg-white/30" />
            <div className="h-4 w-16 rounded bg-white/30" />
            <div className="h-4 w-10 rounded bg-white/30" />
          </div>
          <div className="h-9 w-36 rounded bg-white/20" />
        </div>
      </div>

      <main className="mx-auto grid max-w-[1480px] gap-10 px-5 py-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8 lg:py-12 xl:grid-cols-[210px_minmax(0,860px)_210px] xl:justify-between xl:gap-12">
        <aside className="space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </aside>
        <section className="space-y-7">
          <Skeleton className="h-9 w-2/5" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-4 border-b border-slate-200 pb-7">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </section>
        <aside className="hidden space-y-5 xl:block">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-36 w-full" />
        </aside>
      </main>
    </div>
  )
}
