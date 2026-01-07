"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import Navbar from "@/components/NavBar";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerRecordsSkeleton from "@/skeletons/CustomerRecordsSkeleton";
import { useNavigate } from "react-router-dom";
import { getStatusFromTimes } from "@/utils/statusHelper";
import toast from "react-hot-toast";

interface Staff {
  id: string;
  displayName: string;
}

interface Service {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  photoUrl?: string | null;
}

interface Appointment {
  id: string;
  staffId: string;
  serviceId: string;
  customerId: string;
  startAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  price: number;
  currency: string;
  staff: Staff;
  service: Service;
  customer: Customer;
  checkInTime: string | null;
}

interface CustomerRecord {
  ticketNo: string;
  customerName: string;
  customerId: string;
  mobileNo: string;
  checkInTime: string;
  appointmentTime: string | null;
  assignedTherapist: string;
  payment: string;
  status: "In Exercise" | "Waiting" | "Completed" | "Cancelled";
  appointmentId: string;
  startAt: string;
}

const STATUS_COLORS = {
  "In Exercise": "bg-green-100 text-green-700",
  Waiting: "bg-red-100 text-red-700",
  Completed: "bg-green-200 text-green-800",
  Cancelled: "bg-gray-200 text-gray-700",
};

const STATUS_OPTIONS = ["Waiting", "In Exercise", "Completed", "Cancelled"] as const;

function CustomerRecords() {
  const [records, setRecords] = useState<CustomerRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customer");
  const [timeFilter, setTimeFilter] = useState<"today" | "upcoming" | "recent">(
    "today",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [customerCount, setCustomerCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const badgeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navigate = useNavigate();
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    fetchAppointments(timeFilter);
  }, [timeFilter]);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, timeFilter]);

  // Compute paginated records
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);

  const fetchAppointments = async (filter: "today" | "upcoming" | "recent") => {
    setLoading(true);
    try {
      // Time bounds
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );

      // Build params based on selected filter
      const params: Record<string, any> = { limit: 1000 };
      if (filter === "today") {
        params.startDate = startOfToday.toISOString();
        params.endDate = endOfToday.toISOString();
      } else if (filter === "upcoming") {
        params.startDate = startOfToday.toISOString();
      } else if (filter === "recent") {
        params.limit = 500;
      }

      const { data } = await axiosInstance.get("/appointments", { params });

      const appointments: Appointment[] = data?.data || [];

      // Transform appointments to customer records
      const customerRecords: CustomerRecord[] = appointments
        .map((apt) => {
          const customerName =
            [apt.customer.firstName, apt.customer.lastName]
              .filter(Boolean)
              .join(" ") || "N/A";

          const maskedPhone = apt.customer.phone
            ? apt.customer.phone.slice(0, 4) +
              "*****" +
              apt.customer.phone.slice(-1)
            : "N/A";

          const appointmentTime = apt.startAt
            ? new Date(apt.startAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : null;

          const checkInTime = apt.checkInTime
            ? new Date(apt.checkInTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "...................";

          // Use dynamic status based on startAt and endAt times
          // If it's cancelled in the backend, respect that
          let status: string;
          if (apt.status === "CANCELLED") {
            status = "Cancelled";
          } else {
            status = getStatusFromTimes(apt.startAt, apt.endAt);
          }

          const paymentStatus =
            apt.price === 0 ? "Full Paid" : `₹${apt.price}K Pending`;

          return {
            ticketNo: apt.id.slice(0, 5).toUpperCase(),
            customerName,
            customerId: apt.customer.id || apt.customerId,
            mobileNo: maskedPhone,
            checkInTime,
            appointmentTime,
            assignedTherapist: apt.staff.displayName,
            payment: paymentStatus,
            status,
            appointmentId: apt.id,
            startAt: apt.startAt,
          };
        })
        .filter((record) => record.customerId);

      // Apply additional client-side shaping per filter
      let shaped = customerRecords;
      if (filter === "today") {
        shaped = customerRecords.filter((r) => {
          return true;
        });
      } else if (filter === "upcoming") {
        // Already constrained by API params
      } else if (filter === "recent") {
        shaped = appointments
          .slice(0, 100)
          .map((apt) => {
            const customerName =
              [apt.customer.firstName, apt.customer.lastName]
                .filter(Boolean)
                .join(" ") || "N/A";
            const maskedPhone = apt.customer.phone
              ? apt.customer.phone.slice(0, 4) +
                "*****" +
                apt.customer.phone.slice(-1)
              : "N/A";
            const appointmentTime = apt.startAt
              ? new Date(apt.startAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : null;
            const checkInTime = apt.checkInTime
              ? new Date(apt.checkInTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "...................";
            
            // Use dynamic status based on startAt and endAt times
            // If it's cancelled in the backend, respect that
            let status: string;
            if (apt.status === "CANCELLED") {
              status = "Cancelled";
            } else {
              status = getStatusFromTimes(apt.startAt, apt.endAt);
            }
            
            const paymentStatus =
              apt.price === 0 ? "Full Paid" : `₹${apt.price}K Pending`;
            return {
              ticketNo: apt.id.slice(0, 5).toUpperCase(),
              customerName,
              customerId: apt.customer.id || apt.customerId,
              mobileNo: maskedPhone,
              checkInTime,
              appointmentTime,
              assignedTherapist: apt.staff.displayName,
              payment: paymentStatus,
              status,
              appointmentId: apt.id,
              startAt: apt.startAt,
            } as CustomerRecord;
          });
      }

      setRecords(shaped);
      setFilteredRecords(shaped);
      setCurrentPage(1);
      setCustomerCount(shaped.length);

      // Count unique staff
      const uniqueStaff = new Set(appointments.map((apt) => apt.staffId));
      setStaffCount(uniqueStaff.size);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      setCurrentPage(1);
      return;
    }

    const filtered = records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    setUpdatingId(appointmentId);
    try {
      // Map frontend labels to backend enum values
      const statusMap: Record<string, string> = {
        "Waiting": "PENDING",
        "In Exercise": "CONFIRMED",
        "Completed": "COMPLETED",
        "Cancelled": "CANCELLED",
      };
      
      const backendStatus = statusMap[newStatus] || newStatus;

      await axiosInstance.put(`/appointments/${appointmentId}`, {
        status: backendStatus,
      });

      // Update local state
      setRecords((prevRecords) =>
        prevRecords.map((r) =>
          r.appointmentId === appointmentId
            ? { ...r, status: newStatus as any }
            : r,
        ),
      );

      // Re-filter to update filtered records
      const updated = records.map((r) =>
        r.appointmentId === appointmentId
          ? { ...r, status: newStatus as any }
          : r,
      );
      setFilteredRecords(
        updated.filter((record) =>
          Object.values(record).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        ),
      );

      toast.success(`Status updated to ${newStatus}`);
      setOpenDropdown(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <CustomerRecordsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <Navbar />
      <div className="container mx-auto px-10 py-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger
                value="customer"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Customer ({customerCount})
              </TabsTrigger>
              <TabsTrigger
                value="staffs"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Staffs ({staffCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Time Tabs */}
          <div className="flex gap-4 mb-6 items-center justify-between">
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
            <Tabs
              value={timeFilter}
              onValueChange={(v) => setTimeFilter(v as any)}
            >
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Recent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Customer Records Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Customer <span className="text-blue-600">Records</span>
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            {(() => {
              // Group records by date (YYYY-MM-DD format)
              const recordsByDate = paginatedRecords.reduce(
                (acc, record) => {
                  const date = new Date(record.startAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  );
                  const dateKey = new Date(record.startAt)
                    .toISOString()
                    .split("T")[0];

                  if (!acc[dateKey]) {
                    acc[dateKey] = { displayDate: date, records: [] };
                  }
                  acc[dateKey].records.push(record);
                  return acc;
                },
                {} as Record<
                  string,
                  { displayDate: string; records: typeof filteredRecords }
                >,
              );

              // Sort dates in reverse (newest first)
              const sortedDateKeys = Object.keys(recordsByDate).sort(
                (a, b) => new Date(b).getTime() - new Date(a).getTime(),
              );

              return (
                <>
                  {sortedDateKeys.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Ticket No.
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Customer Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Mobile No.
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Check-in Time
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Appointment Time
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Assigned Therapist
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Payment
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedDateKeys.map((dateKey) => (
                          <React.Fragment key={dateKey}>
                            {/* Date Divider Row */}
                            <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                              <td
                                colSpan={8}
                                className="py-3 px-4 font-semibold text-gray-800 text-sm border-l-4 border-blue-500"
                              >
                                {recordsByDate[dateKey].displayDate}
                              </td>
                            </tr>
                            {/* Records for this date */}
                            {recordsByDate[dateKey].records.map((record) => (
                              <tr
                                key={record.appointmentId}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-3 px-4 text-gray-600">
                                  {record.ticketNo}
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900">
                                  {record.customerId ? (
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/customer-profile?id=${record.customerId}`,
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                    >
                                      {record.customerName}
                                    </button>
                                  ) : (
                                    <span>{record.customerName}</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {record.mobileNo}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {record.checkInTime}
                                </td>
                                <td className="py-3 px-4 text-green-600 font-medium">
                                  {record.appointmentTime ||
                                    "..................."}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {record.assignedTherapist}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {record.payment}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="relative inline-block">
                                    <button
                                      ref={(el) => {
                                        if (el) badgeRefs.current[record.appointmentId] = el;
                                      }}
                                      onClick={() => {
                                        if (openDropdown === record.appointmentId) {
                                          setOpenDropdown(null);
                                        } else {
                                          setOpenDropdown(record.appointmentId);
                                          setTimeout(() => {
                                            const btn = badgeRefs.current[record.appointmentId];
                                            if (btn) {
                                              const rect = btn.getBoundingClientRect();
                                              const dropdownHeight = 180; // Approximate height for 4 options
                                              const spaceBelow = window.innerHeight - rect.bottom;
                                              
                                              if (spaceBelow < dropdownHeight) {
                                                setDropdownPos({
                                                  top: rect.top - dropdownHeight,
                                                  left: rect.left,
                                                });
                                              } else {
                                                setDropdownPos({
                                                  top: rect.bottom + 4,
                                                  left: rect.left,
                                                });
                                              }
                                            }
                                          }, 0);
                                        }
                                      }}
                                      className="flex items-center gap-1"
                                      disabled={updatingId === record.appointmentId}
                                    >
                                      <Badge
                                        className={`${
                                          STATUS_COLORS[record.status]
                                        } cursor-pointer flex items-center gap-1`}
                                      >
                                        {record.status}
                                        <ChevronDown className="h-3 w-3" />
                                      </Badge>
                                    </button>

                                    {/* Dropdown Menu - Fixed positioned to avoid scrollbar */}
                                    {openDropdown === record.appointmentId && dropdownPos && (
                                      <div 
                                        className="fixed bg-white border border-gray-200 rounded shadow-lg z-50 min-w-32"
                                        style={{
                                          top: `${dropdownPos.top}px`,
                                          left: `${dropdownPos.left}px`,
                                        }}
                                      >
                                        {STATUS_OPTIONS.map((status) => (
                                          <button
                                            key={status}
                                            onClick={() =>
                                              handleStatusChange(
                                                record.appointmentId,
                                                status,
                                              )
                                            }
                                            disabled={
                                              updatingId === record.appointmentId
                                            }
                                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t last:rounded-b ${
                                              record.status === status
                                                ? "bg-blue-50 font-semibold text-blue-600"
                                                : ""
                                            } disabled:opacity-50`}
                                          >
                                            {status}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No customer records found
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * RECORDS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    currentPage * RECORDS_PER_PAGE,
                    filteredRecords.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filteredRecords.length}</span>{" "}
                records
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-blue-600"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-blue-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerRecords;
