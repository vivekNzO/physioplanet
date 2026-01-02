export default function PackageSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-full md:w-[calc(50%-0.5rem)] rounded-lg bg-[#F8F8F8] p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            {/* Package name */}
            <div className="h-5 w-2/3 rounded bg-gray-300" />

            {/* Price */}
            <div className="h-5 w-14 rounded bg-gray-300" />
          </div>

          {/* subtle divider spacing */}
          <div className="mt-3 h-3 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}
