import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-8 px-5 py-12" aria-hidden="true">
      <div className="space-y-4"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-3/5 max-w-xl" /><Skeleton className="h-5 w-2/5 max-w-sm" /></div>
      <div className="space-y-4 pt-5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-40 w-full" /></div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-7 px-5 py-12" aria-hidden="true">
      <Skeleton className="h-9 w-44" />
      <div className="space-y-5 border border-slate-200 bg-white p-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="ml-auto h-10 w-28" /></div>
    </div>
  )
}
