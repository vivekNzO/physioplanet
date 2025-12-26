export default function QueueListSkeleton() {
 return (
    <div className="w-96 border-r bg-white border-gray-200 flex flex-col shadow-sm mr-[10px] animate-pulse">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Title */}
        <div className="flex items-end gap-2 mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-blue-200 rounded" />
        </div>

        {/* Search + Button */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-md" />
          <div className="h-10 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md" />
        </div>
      </div>

      {/* Queue Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gray-200" />

              {/* Text */}
              <div className="flex-1">
                <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Status pill */}
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
