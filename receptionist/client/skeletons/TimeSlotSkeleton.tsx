
import { format } from 'date-fns'
import { Skeleton } from "../components/ui/skeleton"

export default function TimeSlotSkeleton({date}: {date: Date}) {
  return (
    <div className="space-y-6">

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length:8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md p-4 flex flex-col items-center justify-center shadow"
          >
            <Skeleton className="h-4 w-32  opacity-80 rounded" />
            <Skeleton className="h-3 w-24 mt-2 opacity-80 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
