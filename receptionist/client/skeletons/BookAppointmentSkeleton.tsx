import { Skeleton } from "@/components/ui/skeleton"

export default function BookAppointmentSkeleton() {
  return (
    <div className="min-h-screen w-full  animate-pulse flex flex-col justify-center items-center">
      {/* Title */}
      <div className=" max-w-screen-xl w-full flex justify-center mb-6">
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      <div className="flex justify-center mb-6">
        <Skeleton className="h-10 w-96 rounded-md" />
      </div>

      <div className="max-w-screen-xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT: Staff + Calendar */}
        <div className="space-y-6 md:col-span-1">
          {/* Staff dropdown */}
          <Skeleton className="h-10 w-full rounded-md" />

          {/* Calendar skeleton */}
          <div className="p-4 bg-white rounded shadow space-y-3">
            <Skeleton className="h-6 w-40 mx-auto" />
            {/* Grid of dates */}
            <div className="grid grid-cols-7 gap-2 mt-3">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Timeslots */}
        <div className="md:col-span-2 bg-white p-6 rounded shadow">
          <div className="flex justify-center mb-4">
            <Skeleton className="h-6 w-56" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
