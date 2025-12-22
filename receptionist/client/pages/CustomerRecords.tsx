"use client"

import React, { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/lib/axios"
import Navbar from "@/components/NavBar"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

interface Staff {
  id: string
  displayName: string
}

interface Service {
  id: string
  name: string
}

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
}

interface Appointment {
  id: string
  staffId: string
  serviceId: string
  customerId: string
  startAt: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
  price: number
  currency: string
  staff: Staff
  service: Service
  customer: Customer
  checkInTime: string | null
}

interface CustomerRecord {
  ticketNo: string
  customerName: string
  customerId: string
  mobileNo: string
  checkInTime: string
  appointmentTime: string | null
  assignedTherapist: string
  payment: string
  status: "In Exercise" | "Waiting" | "Completed"
  appointmentId: string
}

const STATUS_COLORS = {
  "In Exercise": "bg-green-100 text-green-700",
  Waiting: "bg-red-100 text-red-700",
  Completed: "bg-green-200 text-green-800",
}
function CustomerRecords() {
  const [records, setRecords] = useState<CustomerRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("customer")
  const [customerCount, setCustomerCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchTerm, records])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      // Fetch today's appointments
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const { data } = await axiosInstance.get("/appointments", {
        params: {
          startDate: startOfDay,
          endDate: endOfDay,
          limit: 1000,
        },
      })

      const appointments: Appointment[] = data?.data || []

      // Transform appointments to customer records
      const customerRecords: CustomerRecord[] = appointments.map((apt) => {
        const customerName = [apt.customer.firstName, apt.customer.lastName]
          .filter(Boolean)
          .join(" ") || "N/A"
        
        const maskedPhone = apt.customer.phone
          ? apt.customer.phone.slice(0, 4) + "*****" + apt.customer.phone.slice(-1)
          : "N/A"

        const appointmentTime = apt.startAt
          ? new Date(apt.startAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : null

        const checkInTime = apt.checkInTime
          ? new Date(apt.checkInTime).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "..................."

        let status: "In Exercise" | "Waiting" | "Completed"
        if (apt.status === "COMPLETED") {
          status = "Completed"
        } else if (apt.checkInTime) {
          status = "In Exercise"
        } else {
          status = "Waiting"
        }

        const paymentStatus =
          apt.price === 0 ? "Full Paid" : `₹${apt.price}K Pending`

        return {
          ticketNo: apt.id.slice(0, 5).toUpperCase(),
          customerName,
          customerId: apt.customer.id || apt.customerId, // Fallback to customerId if customer.id is missing
          mobileNo: maskedPhone,
          checkInTime,
          appointmentTime,
          assignedTherapist: apt.staff.displayName,
          payment: paymentStatus,
          status,
          appointmentId: apt.id,
        }
      }).filter(record => record.customerId) // Filter out records without customerId

      setRecords(customerRecords)
      setFilteredRecords(customerRecords)
      setCustomerCount(customerRecords.length)
      
      // Count unique staff
      const uniqueStaff = new Set(appointments.map(apt => apt.staffId))
      setStaffCount(uniqueStaff.size)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records)
      return
    }

    const filtered = records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredRecords(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="customer" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Customer ({customerCount})
              </TabsTrigger>
              <TabsTrigger value="staffs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Staffs ({staffCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          {/* Customer Records Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Customer <span className="text-blue-600">Records</span>
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mobile No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Appointment Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Therapist</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.appointmentId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-600">{record.ticketNo}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {record.customerId ? (
                        <button
                          onClick={() => navigate(`/customer-profile?id=${record.customerId}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                        >
                          {record.customerName}
                        </button>
                      ) : (
                        <span>{record.customerName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{record.mobileNo}</td>
                    <td className="py-3 px-4 text-gray-600">{record.checkInTime}</td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      {record.appointmentTime || "..................."}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{record.assignedTherapist}</td>
                    <td className="py-3 px-4 text-gray-600">{record.payment}</td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_COLORS[record.status]}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No customer records found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerRecords