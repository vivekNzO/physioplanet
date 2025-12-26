import AppointmentDetailsSkeleton from "./AppointmentDetailsSkeleton"
import QueueListSkeleton from "./QueueListSkeleton"
import Navbar from "@/components/NavBar"

export default function QueuePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 to-blue-100">      
      {/* Main Content */}
      <div className="container mx-auto px-10 py-10">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel Skeleton */}
          <QueueListSkeleton />

          {/* Right Panel Skeleton */}
          <AppointmentDetailsSkeleton />
        </div>
      </div>
    </div>
  )
}
