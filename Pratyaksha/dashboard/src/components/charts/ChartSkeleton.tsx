import { Skeleton } from "../ui/skeleton"
import { cn } from "../../lib/utils"

interface ChartSkeletonProps {
  type: 'pie' | 'line' | 'bar' | 'radar' | 'calendar' | 'cloud' | 'bubble'
  className?: string
}

export function ChartSkeleton({ type, className }: ChartSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {type === 'pie' && (
        <div className="flex flex-col items-center justify-center gap-4 h-[200px]">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-3 w-14 rounded" />
            ))}
          </div>
        </div>
      )}

      {type === 'line' && (
        <div className="flex flex-col gap-4 h-[200px]">
          <div className="flex-1 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-3 w-8 rounded" />
            ))}
          </div>
        </div>
      )}

      {type === 'bar' && (
        <div className="flex flex-col gap-3 h-[200px]">
          {[80, 60, 90, 45, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-6 rounded" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      )}

      {type === 'radar' && (
        <div className="flex items-center justify-center h-[200px]">
          <div className="relative">
            <Skeleton className="h-32 w-32 rounded-full opacity-30" />
            <Skeleton className="absolute top-4 left-4 h-24 w-24 rounded-full opacity-50" />
            <Skeleton className="absolute top-8 left-8 h-16 w-16 rounded-full opacity-70" />
          </div>
        </div>
      )}

      {type === 'calendar' && (
        <div className="flex flex-col gap-2 h-[200px]">
          <div className="flex justify-between mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                <Skeleton
                  key={col}
                  className="h-6 w-6 rounded"
                  style={{ opacity: Math.random() * 0.5 + 0.2 }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {type === 'cloud' && (
        <div className="flex flex-wrap justify-center items-center gap-2 h-[200px] p-4">
          {[24, 16, 20, 14, 18, 12, 22, 14, 16, 10].map((size, i) => (
            <Skeleton
              key={i}
              className="rounded"
              style={{
                height: `${size}px`,
                width: `${size * 3 + Math.random() * 30}px`
              }}
            />
          ))}
        </div>
      )}

      {type === 'bubble' && (
        <div className="relative h-[200px]">
          {[
            { x: 20, y: 30, s: 40 },
            { x: 50, y: 50, s: 60 },
            { x: 70, y: 25, s: 35 },
            { x: 35, y: 70, s: 45 },
            { x: 80, y: 60, s: 50 },
          ].map((b, i) => (
            <Skeleton
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.s}px`,
                height: `${b.s}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ChartCardSkeleton({ type = 'line' }: { type?: ChartSkeletonProps['type'] }) {
  return (
    <div className="rounded-xl glass-card p-4">
      <div className="mb-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <ChartSkeleton type={type} />
    </div>
  )
}
