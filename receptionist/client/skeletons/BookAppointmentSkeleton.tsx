export default function BookAppointmentSkeleton() {
  return (
    <div className="max-w-[784px] max-lg:max-w-full w-full animate-pulse">
      {/* Heading */}
      <div className="h-[36px] max-lg:h-[24px] w-[380px] max-lg:w-[280px] mx-auto bg-slate-200 rounded mb-4 max-lg:mb-2" />
      <div className="h-4 max-lg:h-3 w-[160px] max-lg:w-[120px] mx-auto bg-slate-200 rounded mb-[6px] max-lg:mb-2" />

      <div className="max-w-6xl w-full mx-auto">
        {/* Select Staff */}
        <div className="w-full mb-6 max-lg:mb-3">
          <div className="h-5 max-lg:h-4 w-[90px] max-lg:w-[70px] bg-slate-200 rounded mb-2 px-1" />
          <div className="h-[42px] max-lg:h-[38px] w-full rounded bg-slate-200" />
        </div>

        {/* Calendar + Slots */}
        <div className="mt-6 max-lg:mt-3 grid grid-cols-1 md:grid-cols-2 items-end gap-6 max-lg:gap-3">
          {/* Calendar */}
          <div className="flex flex-col gap-4 max-lg:gap-3">
            <div className="h-[280px] max-lg:h-[240px] w-full rounded bg-slate-200" />
          </div>

          {/* Time Slots */}
          <div className="p-4 max-lg:p-3 rounded pt-[18px] max-lg:pt-3 pl-[45px] max-lg:pl-3 pr-4 max-lg:pr-3 pb-0 max-h-[345px] max-lg:max-h-[280px] overflow-hidden w-full">
            <div className="space-y-3 max-lg:space-y-2 max-h-[250px] overflow-hidden w-full">
              {/* Date header skeleton */}
              <div className="h-[24px] max-lg:h-[20px] w-[200px] max-lg:w-[160px] mx-auto bg-slate-200 rounded" />
              {/* Slots grid - matching TimeSlots component's grid-cols-2 layout */}
              <div className="max-h-[260px] overflow-auto w-full">
                <div className="grid grid-cols-2 gap-[10px] max-lg:gap-2 w-full">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[38px] max-lg:h-[32px] w-full min-w-0 rounded bg-slate-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
