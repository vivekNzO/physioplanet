
import Navbar from "@/components/NavBar"

export default function CustomerProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      <Navbar />

      <div className="pt-[44px] px-6 pb-6">
        <div className="max-w-7xl mx-auto animate-pulse">

          {/* Top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 mb-4" />
              <div className="h-5 w-40 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-36 bg-gray-200 rounded" />
            </div>

            {/* General Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-5 w-48 bg-gray-300 rounded mb-4" />

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-300 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Summary */}
            <div className="bg-blue-500 rounded-lg shadow-md p-6">
              <div className="h-5 w-40 bg-blue-300 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-44 bg-blue-200 rounded" />
                <div className="h-4 w-48 bg-blue-200 rounded" />
                <div className="h-4 w-40 bg-blue-200 rounded" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="h-14 bg-white rounded-lg shadow-md" />
            <div className="h-14 bg-green-400 rounded-lg shadow-md" />
          </div>

          {/* Tabs + Filters */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-6">
                <div className="h-5 w-32 bg-gray-300 rounded" />
                <div className="h-5 w-32 bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-44 bg-gray-200 rounded-lg" />
            </div>

            {/* Table Skeleton */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <th key={i} className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Array.from({ length: 5 }).map((_, row) => (
                    <tr key={row} className="border-b">
                      {Array.from({ length: 7 }).map((_, col) => (
                        <td key={col} className="px-6 py-4">
                          <div
                            className={`h-4 rounded ${
                              col === 3
                                ? "w-20 bg-gray-200"
                                : "w-24 bg-gray-300"
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
