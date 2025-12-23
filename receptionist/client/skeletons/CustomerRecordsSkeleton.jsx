import Navbar from "@/components/NavBar"

export default function CustomerRecordsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="bg-white rounded-lg shadow-md p-6">

          {/* Top Tabs */}
          <div className="flex gap-3 mb-6">
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
          </div>

          {/* Search + Time Tabs */}
          <div className="flex gap-4 mb-6 items-center justify-between">
            <div className="h-10 flex-1 bg-gray-200 rounded-md" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-md" />
              <div className="h-10 w-28 bg-gray-200 rounded-md" />
              <div className="h-10 w-24 bg-gray-200 rounded-md" />
            </div>
          </div>

          {/* Title */}
          <div className="h-7 w-64 bg-gray-300 rounded mb-6" />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className="py-3 px-4">
                      <div className="h-4 w-20 bg-gray-300 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Date Divider */}
                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <td colSpan={8} className="py-3 px-4">
                    <div className="h-4 w-48 bg-blue-200 rounded" />
                  </td>
                </tr>

                {/* 8 Skeleton Rows */}
                {Array.from({ length: 8 }).map((_, row) => (
                  <tr key={row} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="h-4 w-16 bg-gray-300 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-40 bg-gray-300 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-32 bg-green-200 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-36 bg-gray-200 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-6 w-20 bg-gray-300 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
