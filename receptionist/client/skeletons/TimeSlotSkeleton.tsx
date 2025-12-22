
import { format } from 'date-fns'
import { Skeleton } from "../components/ui/skeleton"

export default function TimeSlotSkeleton({date}: {date: Date}) {
  return (
<div className="space-y-3 max-h-[250px]">
  {/* Date heading skeleton */}
  <div className="h-[28px] w-[220px] mx-auto rounded bg-gray-200 animate-pulse" />

  {/* Slots container */}
  <div className="max-h-[260px] overflow-hidden pb-24">
    <div className="grid grid-cols-2 gap-[10px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="px-[26.5px] py-[10px] rounded bg-gray-200 animate-pulse"
        >
          {/* time label */}
          <div className="h-[14px] w-[80px] mx-auto rounded bg-gray-300" />

          {/* staff names */}
          <div className="mt-2 h-[8px] w-[60px] mx-auto rounded bg-gray-300" />
        </div>
      ))}
    </div>
  </div>
</div>

  )
}
