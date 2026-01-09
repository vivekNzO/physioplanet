import { useState, useEffect } from "react";
import QueueCard, { QueueItem, PatientQueueStatus } from "@/components/QueueCard";
import AppointmentDetailsPanel from "@/components/AppointmentDetailsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Power, Calendar as CalendarIcon, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import Navbar from "@/components/NavBar";
import QueuePageSkeleton from "@/skeletons/QueuePageSkeleton";
import AppointmentDetailsSkeleton from "@/skeletons/AppointmentDetailsSkeleton";
import { getStatusFromTimes } from "@/utils/statusHelper";
import { getTodayRangeInUtc, utcToIst, istToUtc } from "@/utils/dateUtils";
import BookNewAppointmentDialog from "@/components/dialogs/BookNewAppointmentDialog";
import Calendar from "@/components/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function ReceptionDashboard() {
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false); // Used for background updates only
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Only true on first mount/navigation
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [bookNewAppointmentOpen, setBookNewAppointmentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Callback to refresh queue after new appointment
  const handleAppointmentCreated = async () => {
    await fetchTodaysAppointments(undefined, selectedDate);
  };
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      (async () => {
        setIsInitialLoad(true);
        await fetchTodaysAppointments(undefined, selectedDate);
        setIsInitialLoad(false);
      })();
  }, []);

  // Refetch appointments when selected date changes
  useEffect(() => {
    if (!isInitialLoad && !isSearchMode) {
      // Clear queue immediately when date changes to prevent showing stale data
      setQueueData([]);
      setSelectedItem(null);
      fetchTodaysAppointments(undefined, selectedDate);
    }
  }, [selectedDate]);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearchMode(false);
      fetchTodaysAppointments(undefined, selectedDate);
    }
  }, [searchQuery]);

  const fetchTodaysAppointments = async (preserveSelection?: { customerId: string }, targetDate?: Date) => {
     // Only set loading if not initial load
     if (!isInitialLoad) setLoading(true);
    // Clear queue data immediately to prevent showing stale appointments from previous date
    if (!preserveSelection) {
      setQueueData([]);
    }
    try {
      // Use targetDate if provided, otherwise use selectedDate state (fallback to today)
      const dateToUse = targetDate ?? (selectedDate ? new Date(selectedDate) : new Date());
      
      // Get date range for the selected date in IST, then convert to UTC for API query
      // For Jan 9 IST: 
      //   Start: Jan 9 00:00:00 IST = Jan 8 18:30:00 UTC
      //   End: Jan 10 00:00:00 IST (exclusive) = Jan 9 18:30:00 UTC (exclusive)
      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth();
      const day = dateToUse.getDate();
      
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
      
      // Create UTC timestamps for the selected date at midnight (IST)
      const utcTimestampForISTMidnight = Date.UTC(year, month, day, 0, 0, 0, 0);
      // Use next day's midnight as exclusive end to include full day
      // Create next day properly to handle month boundaries
      const nextDay = new Date(year, month, day + 1);
      const utcTimestampForNextDayISTMidnight = Date.UTC(
        nextDay.getFullYear(),
        nextDay.getMonth(),
        nextDay.getDate(),
        0, 0, 0, 0
      );
      
      // Convert IST to UTC by subtracting the offset
      // This gives us the actual UTC time range that covers the full IST day
      const utcStart = new Date(utcTimestampForISTMidnight - IST_OFFSET_MS);
      const utcEnd = new Date(utcTimestampForNextDayISTMidnight - IST_OFFSET_MS);

      const params = {
        startDate: utcStart.toISOString(),
        endDate: utcEnd.toISOString(),
        limit: 1000,
      };

      // Debug: log the date range being queried
      console.log('=== FETCHING APPOINTMENTS ===');
      console.log('Selected date (dateToUse):', dateToUse.toDateString(), dateToUse.toISOString());
      console.log('UTC range:', { start: utcStart.toISOString(), end: utcEnd.toISOString() });

      const { data } = await axiosInstance.get("/appointments", { params });
      const allAppointments = data?.data || [];
      
      console.log('Fetched appointments:', allAppointments.length);
      allAppointments.forEach((apt: any) => {
        if (apt.appointmentType === 'PREBOOKING') {
          console.log('  - Prebooking:', apt.id, 'startAt:', apt.startAt, 'IST:', utcToIst(apt.startAt)?.toDateString());
        }
      });

      // Get the selected date components (dateToUse is already in local time, treat as IST)
      const selectedYear = dateToUse.getFullYear();
      const selectedMonth = dateToUse.getMonth();
      const selectedDay = dateToUse.getDate();
      console.log('Filtering for date:', { year: selectedYear, month: selectedMonth, day: selectedDay });

      // Helper to check if a UTC date matches the selected date in IST
      function isSelectedDateInIST(utcDateStr) {
        if (!utcDateStr) return false;
        // Convert UTC to IST and compare
        // utcToIst adds 5.5 hours, creating a Date object that represents IST time
        // Since Date objects store UTC internally, we need to use UTC methods to get IST date components
        const istDate = utcToIst(utcDateStr);
        if (!istDate) return false;
        // Use UTC methods because the Date object already has IST offset added
        return (
          istDate.getUTCFullYear() === selectedYear &&
          istDate.getUTCMonth() === selectedMonth &&
          istDate.getUTCDate() === selectedDay
        );
      }

      // Filter for queue: prebookings with startAt on selected date (IST), walk-ins with startAt (if set) or createdAt (if startAt is null) on selected date (IST)
      const todaysAppointments = allAppointments.filter((apt) => {
        if (apt.appointmentType === 'WALKIN') {
          // For walk-ins: if startAt is set (rescheduled), use startAt; otherwise use createdAt (original creation date)
          const dateToCheck = apt.startAt || apt.createdAt;
          const matches = isSelectedDateInIST(dateToCheck);
          if (matches) {
            console.log('Walk-in appointment matches:', apt.id, apt.startAt ? `startAt: ${apt.startAt}` : `createdAt: ${apt.createdAt}`);
          }
          return matches;
        } else if (apt.appointmentType === 'PREBOOKING') {
          const matches = isSelectedDateInIST(apt.startAt);
          if (matches) {
            console.log('Prebooking matches:', apt.id, apt.startAt, 'IST date:', utcToIst(apt.startAt)?.toDateString());
          } else {
            console.log('Prebooking does NOT match:', apt.id, apt.startAt, 'IST date:', utcToIst(apt.startAt)?.toDateString(), 'Selected:', dateToUse.toDateString());
          }
          return matches;
        }
        return false;
      });
      
      console.log('Filtered appointments for queue:', todaysAppointments.length);

      // Group appointments by customer
      const customerMap = new Map<string, QueueItem>();
      todaysAppointments.forEach((apt: any) => {
        const customerId = apt.customer?.id || apt.customerId;
        if (!customerMap.has(customerId)) {
          let queueStatus = PatientQueueStatus.WAITING;
          
          const allowedStatuses = [
            PatientQueueStatus.WAITING,
            PatientQueueStatus.IN_EXERCISE,
            PatientQueueStatus.COMPLETED,
            PatientQueueStatus.CANCELLED,
          ];

          // If status is CANCELLED (manually set), keep it
          if (apt.status === PatientQueueStatus.CANCELLED) {
            queueStatus = PatientQueueStatus.CANCELLED;
          } else {
            // Otherwise, determine status based on startAt and endAt times
            const autoStatus = getStatusFromTimes(apt.startAt, apt.endAt);
            if (autoStatus === "Waiting") {
              queueStatus = PatientQueueStatus.WAITING;
            } else if (autoStatus === "In Exercise") {
              queueStatus = PatientQueueStatus.IN_EXERCISE;
            } else if (autoStatus === "Completed") {
              queueStatus = PatientQueueStatus.COMPLETED;
            }
          }
          customerMap.set(customerId, {
            id: customerId,
            ticketNo: apt.id.slice(-5).toUpperCase(),
            customer: apt.customer,
            appointments: [apt], // Always include the current appointment for status updates
            queueStatus,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
          });
        }
        const item = customerMap.get(customerId)!;
        if (!item.appointments.find(a => a.id === apt.id)) {
          item.appointments.push(apt);
        }
      });

      const queueItems = await Promise.all(
        Array.from(customerMap.values()).map(async (item) => {
          try {
            // Fetch total payments and purchases for this customer
            const [paymentRes, purchaseRes] = await Promise.all([
              axiosInstance.get(`/payments/summary?customerId=${item.customer.id}`).catch(() => ({ data: { success: false, data: { totalPaid: 0 } } })),
              axiosInstance.get(`/purchase/summary?customerId=${item.customer.id}`).catch(() => ({ data: { success: false, data: { totalPurchased: 0 } } })),
            ]);

            const totalPaid = paymentRes.data?.success ? paymentRes.data.data.totalPaid : 0;
            const totalPurchased = purchaseRes.data?.success ? purchaseRes.data.data.totalPurchased : 0;

            const paidAmount = totalPaid;
            const totalAmount = totalPurchased;
            const pendingAmount = Math.max(0, totalPurchased - totalPaid);

            return {
              ...item,
              totalAmount,
              paidAmount,
              pendingAmount,
            };
          } catch (error) {
            console.error(`Error fetching payment/purchase summary for customer ${item.customer.id}:`, error);
            // Fallback to zero if API fails
            return {
              ...item,
              totalAmount: 0,
              paidAmount: 0,
              pendingAmount: 0,
            };
          }
        })
      );

      console.log('Setting queue data with', queueItems.length, 'items for date:', dateToUse.toDateString());
      setQueueData(queueItems);
      
      // If we need to preserve selection, find and select that customer
      if (preserveSelection) {
        const customerToSelect = queueItems.find(item => item.customer.id === preserveSelection.customerId);
        if (customerToSelect) {
          await handleSelectCustomer(customerToSelect);
        }
      } else if (queueItems.length > 0) {
        // Fetch appointments for the first customer
        await handleSelectCustomer(queueItems[0]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      if (!isInitialLoad) setLoading(false);
    }
  };

  // Refresh customer data (e.g., after avatar update)
  const refreshCustomerData = async (customerId: string) => {
    try {
      // Fetch updated customer data
      const { data } = await axiosInstance.get(`/customers/${customerId}`);
      
      if (data?.data) {
        const updatedCustomer = data.data;
        
        // Update queue data
        setQueueData(prevQueue => 
          prevQueue.map(item => 
            item.customer.id === customerId 
              ? { ...item, customer: updatedCustomer }
              : item
          )
        );
        
        // Update selected item if it's the same customer
        if (selectedItem && selectedItem.customer.id === customerId) {
          setSelectedItem(prev => prev ? { ...prev, customer: updatedCustomer } : null);
        }
      }
    } catch (error) {
      console.error("Error refreshing customer data:", error);
    }
  };

  // Refresh payment summary for a specific customer
  const refreshCustomerPaymentSummary = async (customerId: string) => {
    try {
      // Fetch updated payment and purchase totals
      const [paymentRes, purchaseRes] = await Promise.all([
        axiosInstance.get(`/payments/summary?customerId=${customerId}`).catch(() => ({ data: { success: false, data: { totalPaid: 0 } } })),
        axiosInstance.get(`/purchase/summary?customerId=${customerId}`).catch(() => ({ data: { success: false, data: { totalPurchased: 0 } } })),
      ]);

      const totalPaid = paymentRes.data?.success ? paymentRes.data.data.totalPaid : 0;
      const totalPurchased = purchaseRes.data?.success ? purchaseRes.data.data.totalPurchased : 0;
      const paidAmount = totalPaid;
      const totalAmount = totalPurchased;
      const pendingAmount = Math.max(0, totalPurchased - totalPaid);

      // Update queue data
      setQueueData(prevQueue => 
        prevQueue.map(item => 
          item.customer.id === customerId 
            ? { ...item, totalAmount, paidAmount, pendingAmount }
            : item
        )
      );

      // Update selected item if it's the same customer
      if (selectedItem && selectedItem.customer.id === customerId) {
        setSelectedItem(prev => prev ? { ...prev, totalAmount, paidAmount, pendingAmount } : null);
      }
    } catch (error) {
      console.error("Error refreshing payment summary:", error);
    }
  };

  // Refresh appointment data for a specific customer (used after updating walk-in appointments)
  const refreshCustomerAppointment = async (customerId: string, appointmentId?: string) => {
    try {
      // Helper to check if a UTC date matches the selected date in IST (same as in fetchTodaysAppointments)
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedDateValue = selectedDate.getDate();

      function isSelectedDateInIST(utcDateStr) {
        if (!utcDateStr) return false;
        // Convert UTC to IST and compare
        // utcToIst adds 5.5 hours, creating a Date object that represents IST time
        // Since Date objects store UTC internally, we need to use UTC methods to get IST date components
        const istDate = utcToIst(utcDateStr);
        if (!istDate) return false;
        // Use UTC methods because the Date object already has IST offset added
        return (
          istDate.getUTCFullYear() === selectedYear &&
          istDate.getUTCMonth() === selectedMonth &&
          istDate.getUTCDate() === selectedDateValue
        );
      }

      // Fetch the updated appointment to check its new date
      if (appointmentId) {
        try {
          const { data } = await axiosInstance.get(`/appointments/${appointmentId}`);
          const updatedAppointment = data?.data || data;

          if (updatedAppointment) {
            // Check if the appointment is still for the selected date
            // For walk-ins: if startAt is set (rescheduled), use startAt; otherwise use createdAt
            // For pre-bookings: always use startAt
            const dateToCheck = updatedAppointment.appointmentType === 'WALKIN'
              ? (updatedAppointment.startAt || updatedAppointment.createdAt)
              : updatedAppointment.startAt;
            
            const isStillForSelectedDate = isSelectedDateInIST(dateToCheck);

            console.log('Refresh check - Appointment:', updatedAppointment.id, 'Type:', updatedAppointment.appointmentType);
            console.log('  startAt:', updatedAppointment.startAt, 'createdAt:', updatedAppointment.createdAt);
            console.log('  Date to check:', dateToCheck, 'IST:', utcToIst(dateToCheck)?.toDateString());
            console.log('  Selected date:', selectedDate.toDateString());
            console.log('  Still for selected date?', isStillForSelectedDate);

            if (!isStillForSelectedDate) {
              // Appointment was rescheduled to another date - remove it from queue
              setQueueData(currentQueue => {
                const updatedQueue = currentQueue.map(item => {
                  if (item.customer.id !== customerId) return item;
                  
                  // Filter out the rescheduled appointment
                  const remainingAppointments = item.appointments.filter(apt => apt.id !== appointmentId);
                  
                  // If no appointments left for today, remove the entire customer from queue
                  if (remainingAppointments.length === 0) {
                    return null; // Mark for removal
                  }
                  
                  return { ...item, appointments: remainingAppointments };
                }).filter(item => item !== null) as QueueItem[]; // Remove null entries

                return updatedQueue;
              });

              // Clear selected item if it was the rescheduled one
              setSelectedItem(prev => {
                if (!prev || prev.customer.id !== customerId) return prev;
                const remainingAppointments = prev.appointments.filter(apt => apt.id !== appointmentId);
                if (remainingAppointments.length === 0) {
                  return null; // Clear selection if no appointments left
                }
                return { ...prev, appointments: remainingAppointments };
              });

              toast.success("Appointment rescheduled. Removed from queue.");
              // Don't refresh the queue - we've already removed it from the UI
              // This prevents showing "no appointments found" unnecessarily
              return; // Exit early since we've handled the removal
            }

            // Appointment is still for the selected date - update it in the queue
            setQueueData(currentQueue => 
              currentQueue.map(item => 
                item.customer.id === customerId 
                  ? { 
                      ...item, 
                      appointments: item.appointments.map(apt => 
                        apt.id === appointmentId ? updatedAppointment : apt
                      )
                    }
                  : item
              )
            );

            // Update selectedItem with full appointment details
            setSelectedItem(prev => {
              if (!prev || prev.customer.id !== customerId) return prev;
              const updatedAppointments = prev.appointments.map(apt => 
                apt.id === appointmentId ? updatedAppointment : apt
              );
              return { ...prev, appointments: updatedAppointments };
            });
          }
        } catch (err) {
          console.error("Error fetching updated appointment:", err);
        }
      }

      // Refresh the entire queue to ensure consistency
      await fetchTodaysAppointments({ customerId }, selectedDate);
    } catch (error) {
      console.error("Error refreshing customer appointment:", error);
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
        ticketNo: customer.id.slice(-5).toUpperCase(),
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

  // if(isInitialLoad)return <QueuePageSkeleton/>

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Header */}
      <Navbar />
    
      {/* Main Content */}
      <div className="container mx-auto px-10 py-10">
      {isInitialLoad ? (<QueuePageSkeleton/>):(
      <div className="flex-1 flex overflow-hidden gap-[10px] items-stretch">
        {/* Left Panel - Queue List */}
        <div className="max-w-96 w-full border-r bg-white border-gray-200 flex flex-col shadow-sm min-h-0 max-h-[728px]">
          {/* Queue Header */}
          <div className="p-6 border-b border-gray-200 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-[#344256] font-normal">
                {isSearchMode ? (
                  <>Search <span className="text-[#1D5287] font-bold">Results</span></>
                ) : (() => {
                  const today = new Date();
                  const isToday = selectedDate.getFullYear() === today.getFullYear() &&
                    selectedDate.getMonth() === today.getMonth() &&
                    selectedDate.getDate() === today.getDate();
                  
                  if (isToday) {
                    return <>Today's <span className="text-[#1D5287] font-bold">Queue</span></>;
                  } else {
                    return <>Queue for <span className="text-[#1D5287] font-bold">{format(selectedDate, "dd MMM")}</span></>;
                  }
                })()}
              </h2>
              {!isSearchMode && (
                <div className="flex items-center gap-2">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Select date"
                      >
                        <CalendarIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        value={selectedDate}
                        onChange={(selectedDate) => {
                          setSelectedDate(selectedDate);
                          setCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {(() => {
                    const today = new Date();
                    const isToday = selectedDate.getFullYear() === today.getFullYear() &&
                      selectedDate.getMonth() === today.getMonth() &&
                      selectedDate.getDate() === today.getDate();
                    return !isToday ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(new Date());
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Reset to today"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            {(() => {
              const today = new Date();
              const isToday = selectedDate.getFullYear() === today.getFullYear() &&
                selectedDate.getMonth() === today.getMonth() &&
                selectedDate.getDate() === today.getDate();
              
              // Only show search and new appointment button when viewing today's queue
              if (!isToday || isSearchMode) return null;
              
              return (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search patient"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-4 pr-4"
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
              );
            })()}
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading && queueData.length === 0 && !searchLoading ? (
              // Show loading skeleton when refreshing
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-lg animate-pulse"
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
            ) : queueData.length === 0 && !searchLoading && !loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>
                  {isSearchMode 
                    ? "No customers found" 
                    : (() => {
                        const today = new Date();
                        const isToday = selectedDate.getFullYear() === today.getFullYear() &&
                          selectedDate.getMonth() === today.getMonth() &&
                          selectedDate.getDate() === today.getDate();
                        return isToday 
                          ? "No appointments today" 
                          : `No appointments for ${format(selectedDate, "dd MMM yyyy")}`;
                      })()
                  }
                </p>
              </div>
            ) : null}
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
        <div className={`flex-1 border border-gray-200 flex flex-col shadow-sm min-h-0 ${selectedItem ? 'bg-transparent' : 'bg-white'}`}>
          {selectedItem ? (
            loadingAppointments && selectedItem.appointments.length === 0 ? (
              <AppointmentDetailsSkeleton />
            ) : (
              <AppointmentDetailsPanel 
                item={selectedItem} 
                onPaymentRecorded={() => refreshCustomerPaymentSummary(selectedItem.customer.id)}
                onAppointmentUpdated={(appointmentId) => refreshCustomerAppointment(selectedItem.customer.id, appointmentId)}
                onCustomerUpdated={() => refreshCustomerData(selectedItem.customer.id)}
              />
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[624px]">
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
