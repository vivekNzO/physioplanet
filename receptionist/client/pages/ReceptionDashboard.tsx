import { useState, useEffect } from "react";
import QueueCard, { QueueItem, PatientQueueStatus } from "@/components/QueueCard";
import AppointmentDetailsPanel from "@/components/AppointmentDetailsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Power } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import Navbar from "@/components/NavBar";
import QueuePageSkeleton from "@/skeletons/QueuePageSkeleton";
import AppointmentDetailsSkeleton from "@/skeletons/AppointmentDetailsSkeleton";
import { getDefaultStatus } from "@/utils/statusHelper";
import { getTodayRangeInUtc } from "@/utils/dateUtils";
import BookNewAppointmentDialog from "@/components/dialogs/BookNewAppointmentDialog";

export default function ReceptionDashboard() {
  console.log("ReceptionDashboard mounted");
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [bookNewAppointmentOpen, setBookNewAppointmentOpen] = useState(false);

  // Callback to refresh queue after new appointment
  const handleAppointmentCreated = async () => {
    await fetchTodaysAppointments();
  };
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearchMode(false);
      fetchTodaysAppointments();
    }
  }, [searchQuery]);

  const fetchTodaysAppointments = async () => {
    setLoading(true);
    try {
      // Get today's date range in UTC using the helper function
      const { start: utcStartOfToday, end: utcEndOfToday } = getTodayRangeInUtc();

      const params = {
        startDate: utcStartOfToday.toISOString(),
        endDate: utcEndOfToday.toISOString(),
        limit: 1000,
      };

      const { data } = await axiosInstance.get("/appointments", { params });
      const allAppointments = data?.data || [];

      // Get today's date in IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const istYear = istNow.getFullYear();
      const istMonth = istNow.getMonth();
      const istDate = istNow.getDate();

      // Helper to check if a UTC date is today in IST
      function isTodayInIST(utcDateStr) {
        if (!utcDateStr) return false;
        const utcDate = new Date(utcDateStr);
        const istDateObj = new Date(utcDate.getTime() + istOffset);
        return (
          istDateObj.getFullYear() === istYear &&
          istDateObj.getMonth() === istMonth &&
          istDateObj.getDate() === istDate
        );
      }

      // Filter for queue: prebookings with startAt today (IST), walk-ins with createdAt today (IST)
      const todaysAppointments = allAppointments.filter((apt) => {
        if (apt.appointmentType === 'WALKIN') {
          return isTodayInIST(apt.createdAt);
        } else if (apt.appointmentType === 'PREBOOKING') {
          return isTodayInIST(apt.startAt);
        }
        return false;
      });

      // Group appointments by customer
      const customerMap = new Map<string, QueueItem>();
      const allowedStatuses = [
        PatientQueueStatus.WAITING,
        PatientQueueStatus.IN_EXERCISE,
        PatientQueueStatus.COMPLETED,
        PatientQueueStatus.CANCELLED,
      ];

      todaysAppointments.forEach((apt: any) => {
        const customerId = apt.customer?.id || apt.customerId;
        if (!customerMap.has(customerId)) {
          let queueStatus = PatientQueueStatus.WAITING;
          if (apt.appointmentType === 'PREBOOKING') {
            // If receptionist has set a valid status, use it
            if (apt.status && allowedStatuses.includes(apt.status)) {
              queueStatus = apt.status;
            } else {
              // Otherwise, use automatic logic
              const autoStatus = getDefaultStatus(apt.startAt);
              if (autoStatus === "Waiting") {
                queueStatus = PatientQueueStatus.WAITING;
              } else if (autoStatus === "In Exercise") {
                queueStatus = PatientQueueStatus.IN_EXERCISE;
              } else if (autoStatus === "Completed") {
                queueStatus = PatientQueueStatus.COMPLETED;
              }
            }
          } else if (apt.appointmentType === 'WALKIN') {
            // For walk-ins, always WAITING by default unless receptionist overrides with a valid status
            if (apt.status && allowedStatuses.includes(apt.status) && apt.status !== PatientQueueStatus.WAITING) {
              queueStatus = apt.status;
            } else {
              queueStatus = PatientQueueStatus.WAITING;
            }
          }
          customerMap.set(customerId, {
            id: customerId,
            ticketNo: apt.id.slice(0, 5).toUpperCase(),
            customer: apt.customer,
            appointments: [apt], // Always include the current appointment for status updates
            queueStatus,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
          });
        }
        const item = customerMap.get(customerId)!;
        item.totalAmount += parseFloat(apt.price);
        // Mock paid amount - in real app, this would come from payment records
        if (apt.status === PatientQueueStatus.COMPLETED) {
          item.paidAmount += parseFloat(apt.price);
        }
      });

      // Calculate pending amounts
      const queueItems = Array.from(customerMap.values()).map(item => ({
        ...item,
        pendingAmount: item.totalAmount - item.paidAmount,
      }));

      setQueueData(queueItems);
      if (queueItems.length > 0) {
        // Fetch appointments for the first customer
        await handleSelectCustomer(queueItems[0]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (item: QueueItem) => {
    setSelectedItem(item);
    if (item.appointments.length > 0) {
      return;
    }

    // Fetch all appointments for this customer
    setLoadingAppointments(true);
    try {
      const { data } = await axiosInstance.get("/appointments", {
        params: {
          customerId: item.customer.id,
          limit: 1000,
        },
      });

      const allAppointments = data?.data || [];

      // Update the queue item with all appointments
      setQueueData(prevQueue => 
        prevQueue.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, appointments: allAppointments }
            : queueItem
        )
      );

      // Update selected item with appointments
      setSelectedItem(prev => 
        prev?.id === item.id 
          ? { ...prev, appointments: allAppointments }
          : prev
      );
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      toast.error("Failed to load appointment details");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      return;
    }

    setSearchLoading(true);
    setIsSearchMode(true);

    try {
      // Search for customers across the entire database
      const { data } = await axiosInstance.get("/customers", {
        params: {
          search: query,
          limit: 100,
        },
      });

      const searchResults = data?.data || [];

      // Transform customers to QueueItem format
      const queueItems = searchResults.map((customer: any) => ({
        id: customer.id,
        ticketNo: customer.id.slice(0, 5).toUpperCase(),
        customer,
        appointments: [], // Will be loaded on selection
        queueStatus: PatientQueueStatus.WAITING, // Default status for search results
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }));

      setQueueData(queueItems);

      // Clear selection when searching
      setSelectedItem(null);
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Failed to search customers");
      setQueueData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Status update handler for queue items
  const handleQueueStatusChange = (itemId: string, newStatus: PatientQueueStatus) => {
    setQueueData(prevQueue => prevQueue.map(item =>
      item.id === itemId ? { ...item, queueStatus: newStatus } : item
    ));
    // Also update selected item if it's the same
    setSelectedItem(prev =>
      prev && prev.id === itemId ? { ...prev, queueStatus: newStatus } : prev
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Header */}
      <Navbar />
    
      {/* Main Content */}
      <div className="container mx-auto px-10 py-10">
      {loading ? (<QueuePageSkeleton/>):(
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Queue List */}
        <div className="w-96 border-r bg-white border-gray-200 flex flex-col shadow-sm mr-[10px]">
          {/* Queue Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl text-[#344256] font-normal mb-4">
              {isSearchMode ? (
                <>Search <span className="text-[#1D5287] font-bold">Results</span></>
              ) : (
                <>Today's <span className="text-[#1D5287] font-bold">Queue</span></>
              )}
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={isSearchMode ? "Search all customers" : "Search patient"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4"
                  disabled={searchLoading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              <Button className="bg-gradient-to-b from-[#0557A8] to-[#1BB7E9] text-white shrink-0"
              onClick={()=>setBookNewAppointmentOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto max-h-[580px] scrollbar-hide">
            {queueData.length === 0 && !searchLoading && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>{isSearchMode ? "No customers found" : "No appointments today"}</p>
              </div>
            )}
            {queueData.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => handleSelectCustomer(item)}
                onStatusChange={handleQueueStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Appointment Details */}
        <div className="flex-1 overflow-hidden">
          {selectedItem ? (
            loadingAppointments && selectedItem.appointments.length === 0 ? (
              <AppointmentDetailsSkeleton />
            ) : (
              <AppointmentDetailsPanel item={selectedItem} />
            )
          ) : (
            <div className="h-[580px] flex items-center justify-center text-gray-500 bg-white shadow-sm">
              <div className="text-center">
                <p className="text-lg">Select a patient from the queue</p>
                <p className="text-sm text-gray-400 mt-2">Click on any patient to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      </div>
      <BookNewAppointmentDialog
        open={bookNewAppointmentOpen}
        onOpenChange={setBookNewAppointmentOpen}
        onSuccess={handleAppointmentCreated}
      />
    </div>
  );
}
