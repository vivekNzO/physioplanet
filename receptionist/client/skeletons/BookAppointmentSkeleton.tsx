export default function BookAppointmentSkeleton() {
  return (
    <div className="max-w-[784px] w-full animate-pulse">
      {/* Heading */}
      <div className="h-[36px] w-[380px] mx-auto bg-slate-200 rounded mb-4" />
      <div className="h-4 w-[160px] mx-auto bg-slate-200 rounded mb-[6px]" />

      <div className="max-w-6xl w-full mx-auto">
        {/* Select Staff */}
        <div className="w-full mb-6">
          <div className="h-5 w-[90px] bg-slate-200 rounded mb-2 px-1" />
          <div className="h-[42px] w-full rounded bg-slate-200" />
        </div>

        {/* Calendar + Slots */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 items-end gap-6">
          {/* Calendar */}
          <div className="flex flex-col gap-4">
            <div className="h-[280px] w-full rounded bg-slate-200" />
          </div>

          {/* Time Slots */}
          <div className="p-4 rounded pt-[18px] pl-[45px] pr-0 pb-0 max-h-[345px] overflow-hidden">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[38px] w-[85%] rounded bg-slate-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
