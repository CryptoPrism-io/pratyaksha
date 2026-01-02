import { Skeleton } from "./skeleton"

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[40%]" />
      <Skeleton className="h-8 w-[60%]" />
      <Skeleton className="h-3 w-[30%]" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      ))}
    </div>
  )
}
