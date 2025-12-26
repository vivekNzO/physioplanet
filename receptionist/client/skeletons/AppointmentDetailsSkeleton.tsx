export default function AppointmentDetailsSkeleton() {
  return (
    <div className="flex-1 overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b bg-white mb-[10px] border-gray-200 py-6 px-8">
        <div className="mb-[21px]">
          <div className="h-5 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse" />
            <div>
              <div className="h-6 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-32 bg-white border border-gray-300 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cards Row */}
      <div className="flex w-full gap-[10px] flex-1 min-h-[222px] mb-2.5">
        {/* Prescription Photos Card */}
        <div className="flex-1 basis-[40%]">
          <div className="border border-gray-200 rounded-lg py-[21px] px-[15.5px] h-full bg-white">
            <div className="h-7 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-[25px] animate-pulse" />
            <div className="flex items-start gap-4">
              <div className="h-24 w-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded border border-gray-300 animate-pulse" />
              <div className="grid grid-cols-2 gap-3 flex-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="h-16 bg-green-50 rounded border border-green-200 mt-4 p-3 flex items-start gap-2">
              <div className="h-3 w-3 bg-green-300 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-full bg-green-100 rounded animate-pulse" />
                <div className="h-2.5 w-3/4 bg-green-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Plans Card */}
        <div className="flex-1 basis-[30%]">
          <div className="border border-gray-200 rounded-lg p-5 h-full bg-white">
            <div className="h-7 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-[25px] animate-pulse" />
            <div className="space-y-4 mb-6">
              <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-9 w-full bg-gradient-to-r from-[#75B640] to-[#52813C] rounded text-transparent animate-pulse">
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-3 w-20 bg-white/30 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="flex-1 basis-[30%]">
          <div className="border border-gray-200 rounded-lg p-5 h-full bg-white">
            <div className="h-7 w-44 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-[25px] animate-pulse" />
            <div className="space-y-3 mb-6">
              <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
              <div className="h-7 w-40 bg-gradient-to-r from-red-400 to-red-500 rounded animate-pulse" />
              <div className="h-4 w-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-full bg-gradient-to-r from-[#75B640] to-[#52813C] rounded text-transparent animate-pulse">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-3 w-24 bg-white/30 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-white border border-gray-300 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-0 mb-4 bg-blue-600 rounded-lg overflow-hidden h-12 shadow-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full bg-blue-500 animate-pulse flex items-center justify-center border-r border-blue-400 last:border-r-0"
            >
              <div className="h-3 w-20 bg-blue-300/50 rounded" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 p-4 grid grid-cols-4 gap-4 border-b border-gray-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse"
              />
            ))}
          </div>

          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="p-4 grid grid-cols-4 gap-4 border-t border-gray-100"
            >
              {Array.from({ length: 4 }).map((__, j) => (
                <div
                  key={j}
                  className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
