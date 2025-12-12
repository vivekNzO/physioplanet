"use client"

import React, { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar as CalendarIcon, Clock, X, Edit, Trash2, Search, Filter, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import axiosInstance from "@/lib/axios"
import { format } from "date-fns"
import TimeSlots, { Slot } from "@/components/TimeSlots"
import Calendar from "@/components/Calendar"
import StaffSelect from "@/components/StaffSelect"
import { Card, CardContent } from "@/components/ui/card"
import Navbar from "@/components/NavBar"
import BookAppointmentSkeleton from "@/skeletons/BookAppointmentSkeleton"

interface Staff {
  id: string
  displayName: string
  title: string | null
}

interface Service {
  id: string
  name: string
}

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
}

interface Appointment {
  id: string
  staffId: string
  serviceId: string
  customerId: string
  startAt: string
  endAt: string
  status: AppointmentStatus
  price: number
  currency: string
  notes: string | null
  customerNotes: string | null
  staff: Staff
  service: Service
  customer: Customer
  bookedBy: {
    id: string
    username: string
    email: string
  }
}

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
}

function AppointmentsPageContent() {
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>("cmiwu5n8l005i42zxh8lrhfd5") // TODO: fetch actual tenant ID
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [serviceList, setServiceList] = useState<Service[]>([])
  const [customerList, setCustomerList] = useState<Customer[]>([])
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [staffId, setStaffId] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)

  // Filters
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Dialogs
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    staffId: "",
    serviceId: "",
    customerId: "",
    isNewCustomer: false,
    newCustomer: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    },
    startAt: "",
    endAt: "",
    price: "",
    notes: "",
    customerNotes: "",
  })
  // Control whether the additional customer input fields are visible
  const [showCustomerFields, setShowCustomerFields] = useState(false)

  const debouncedPhone = useDebounce(formData.newCustomer.phone || "", 400)
  const lookupController = React.useRef<AbortController | null>(null)
  // skip the next lookup when a suggestion is selected programmatically
  const skipNextLookup = React.useRef(false)
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false)

  useEffect(() => {
    const raw = debouncedPhone || ""
    const phone = raw.replace(/\D/g, "")

    // If we just selected a suggestion, skip this one lookup cycle
    if (skipNextLookup.current) {
      skipNextLookup.current = false
      setCustomerSuggestions([])
      return
    }

    if (!phone || phone.length < 5) {
      // If phone cleared or too short, treat as new customer
      setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
      setCustomerSuggestions([])
      return
    }

    // abort any previous lookup
    if (lookupController.current) {
      try { lookupController.current.abort() } catch (e) {}
      lookupController.current = null
    }

    const ac = new AbortController()
    lookupController.current = ac

    let handled = false

    ;(async () => {
      try {
        setCustomerLookupLoading(true)
        const res = await axiosInstance.get("/customers", {
          params: { phone, limit: 5 },
          signal: ac.signal,
        })
        if (res.status >= 400) {
          if (!ac.signal.aborted) setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
          return
        }

        const json = res.data
        const matches: Customer[] = (json?.data && Array.isArray(json.data) ? json.data : [])

        if (!ac.signal.aborted) {
          if (matches.length === 0) {
            // No matches: offer an explicit "Add {phone}" suggestion so user can choose to add this number
            const addSuggestion: any = { id: '__add__', firstName: '', lastName: '', email: '', phone }
            setCustomerSuggestions([addSuggestion])
            setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
          } else {
            // Show suggestions and let user pick. Do not auto-select to avoid surprising behavior.
            setCustomerSuggestions(matches)
            setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Customer lookup failed:', err)
        if (!ac.signal.aborted) setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
      } finally {
        handled = true
        if (lookupController.current === ac) lookupController.current = null
        setCustomerLookupLoading(false)
      }
    })()

    return () => {
      try { ac.abort() } catch (e) {}
      if (!handled && lookupController.current === ac) lookupController.current = null
    }
  }, [debouncedPhone])

  // Immediate lookup when user presses Enter in phone input
  const handlePhoneEnter = async () => {
    const raw = formData.newCustomer.phone || ""
    const phone = raw.replace(/\D/g, "")
    if (!phone || phone.length < 6) {
      // show fields for new customer even if phone too short
      setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true }))
      setCustomerSuggestions([])
      setShowCustomerFields(true)
      return
    }

    try {
      // Cancel any in-flight lookup
      if (lookupController.current) {
        try { lookupController.current.abort() } catch (e) {}
        lookupController.current = null
      }
      const ac = new AbortController()
      lookupController.current = ac

      const res = await axiosInstance.get("/customers", {
        params: { phone, limit: 5 },
        signal: ac.signal,
      })
      const json = res.data
      const matches: Customer[] = (json?.data && Array.isArray(json.data) ? json.data : [])

      if (matches.length === 0) {
        // No existing customer -> show empty fields for new customer
        setCustomerSuggestions([])
        setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true, newCustomer: { firstName: "", lastName: "", email: "", phone: raw, dateOfBirth: "" } }))
        setShowCustomerFields(true)
      } else {
        // Populate with the first match (prefer exact phone match if present)
        const exact = matches.find(m => (m.phone || "").replace(/\D/g, "") === phone)
        const chosen = exact || matches[0]
        setFormData(prev => ({ ...prev,
          customerId: chosen.id,
          isNewCustomer: false,
          newCustomer: {
            firstName: chosen.firstName ?? "",
            lastName: chosen.lastName ?? "",
            email: chosen.email ?? "",
            phone: chosen.phone ?? raw,
            dateOfBirth: (chosen as any).dateOfBirth ?? "",
          }
        }))
        setCustomerSuggestions([])
        setShowCustomerFields(true)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Phone Enter lookup failed:', err)
      setShowCustomerFields(true)
    } finally {
      if (lookupController.current) lookupController.current = null
    }
  }
  // useEffect(() => {
  //   fetchTenantId()
  // }, [session])

  useEffect(() => {
      fetchStaff()
      fetchServices()
      fetchCustomers()
      fetchAppointments()
  }, [])

  useEffect(() => {
    if (tenantId) {
      fetchAppointments()
    }
  }, [selectedStaffId, selectedStatus, startDate, endDate, tenantId])

  // const fetchTenantId = async () => {
  //   try {
  //     const tenantIdValue = session?.user?.currentTenantId
  //     if (tenantIdValue) {
  //       setTenantId(tenantIdValue)
  //       return
  //     }

  //     const response = await fetch("/      npm install date-fns")
  //     if (response.ok) {
  //       const result = await response.json()
  //       const tenantIdValue = result.currentTenantId || result.tenantId
  //       if (tenantIdValue) {
  //         setTenantId(tenantIdValue)
  //       } else {
  //         setLoading(false)
  //       }
  //     } else {
  //       setLoading(false)
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch tenant ID:", error)
  //     setLoading(false)
  //   }
  // }

  const fetchStaff = async () => {
    try {
      const { data } = await axiosInstance.get("/staff", { params: { isActive: true } })
      setStaffList(data?.data || [])
    } catch (error) {
      console.error("Failed to fetch staff:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const { data } = await axiosInstance.get("/services", { params: { isActive: true, limit: 1000 } })
      setServiceList(data?.data || [])
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const fetchCustomers = async () => {
    try { 
      const { data } = await axiosInstance.get("/customers", { params: { limit: 1000 } })
      setCustomerList(data?.data || [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchAppointments = async () => {
    if (!tenantId) return

    setLoadingAppointments(true)
    try {
      const params: Record<string, string> = { limit: "100" }
      if (selectedStaffId) params.staffId = selectedStaffId
      if (selectedStatus) params.status = selectedStatus
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const { data } = await axiosInstance.get("/appointments", { params })
      setAppointments(data?.data || [])
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingAppointments(false)
      setLoading(false)
    }
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.staffId || !formData.serviceId || !formData.startAt || !formData.endAt) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!formData.isNewCustomer && !formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer or create a new one",
        variant: "destructive",
      })
      return
    }

    if (formData.isNewCustomer && (!formData.newCustomer.firstName || !formData.newCustomer.lastName)) {
      toast({
        title: "Error",
        description: "Please enter customer first and last name",
        variant: "destructive",
      })
      return
    }

    try {
      const payload: any = {
        staffId: formData.staffId,
        serviceId: formData.serviceId,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        price: parseFloat(formData.price) || 0,
        currency: "USD",
        status: "CONFIRMED" as AppointmentStatus,
        notes: formData.notes || null,
        customerNotes: formData.customerNotes || null,
      }

      if (formData.isNewCustomer) {
        payload.customer = {
          firstName: formData.newCustomer.firstName,
          lastName: formData.newCustomer.lastName,
          email: formData.newCustomer.email || null,
          phone: formData.newCustomer.phone || null,
          dateOfBirth: formData.newCustomer.dateOfBirth
            ? new Date(formData.newCustomer.dateOfBirth).toISOString()
            : null,
        }
      } else {
        payload.customerId = formData.customerId
      }

      const response = await axiosInstance.post("/appointments", payload)

      if (!response?.data?.success) {
        toast({
          title: "Error",
          description: response?.data?.error || "Failed to book appointment",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      })

      setBookDialogOpen(false)
      fetchAppointments()
      if (formData.isNewCustomer) {
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleSelectSlot = (slot: Slot) => {
    try {
      setSelectedSlot(slot)

      const safeStart = slot?.startIso ? String(slot.startIso).slice(0, 16) : ""
      const safeEnd = slot?.endIso ? String(slot.endIso).slice(0, 16) : ""

      // Determine default staff for this slot: prefer the currently selected staffId if they're in the slot's available staffIds,
      // otherwise fall back to the first available staff for the slot (if any).
      const slotStaffIds = slot?.staffIds || []
      let defaultStaff = ""
      if (slotStaffIds.length > 0) {
        if (staffId && slotStaffIds.includes(staffId)) defaultStaff = staffId
        else defaultStaff = slotStaffIds[0]
      } else {
        // no specific staff for this slot (aggregated or none): fall back to page-level staff if set
        defaultStaff = staffId || ""
      }

      setFormData(prev => ({
        ...prev,
        staffId: defaultStaff,
        startAt: safeStart,
        endAt: safeEnd,
      }))
      setBookDialogOpen(true)
    } catch (err) {
      console.error('Error in handleSelectSlot:', err)
      setBookDialogOpen(true)
    }
  }

  // Reset form to initial empty state
  const resetForm = () => {
    setFormData({
      staffId: "",
      serviceId: "",
      customerId: "",
      isNewCustomer: false,
      newCustomer: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      },
      startAt: "",
      endAt: "",
      price: "",
      notes: "",
      customerNotes: "",
    })
    setSelectedSlot(null)
    setCustomerSuggestions([])
    setShowCustomerFields(false)
  }

  // Clear transient form data when the booking dialog is closed
  useEffect(() => {
    if (!bookDialogOpen) {
      resetForm()
    }
  }, [bookDialogOpen])

  if (loading) {
    return (
      <BookAppointmentSkeleton/>
    )
  }

  if (!tenantId) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage appointments, bookings, and schedules
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No tenant selected. Please select a tenant first.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine which staff should be shown in the form's staff dropdown.
  const availableStaff = selectedSlot && Array.isArray(selectedSlot.staffIds) && selectedSlot.staffIds.length > 0
    ? staffList.filter(s => selectedSlot!.staffIds!.includes(s.id))
    : staffList

  // Validation for enabling Confirm Booking: require staff, service, start/end AND either
  // an existing selected customer (customerId) OR a new customer with firstName, lastName, email and phone.
  const isCustomerValid = (!formData.isNewCustomer && !!formData.customerId) || (
    formData.isNewCustomer &&
    formData.newCustomer.firstName.trim() !== "" &&
    formData.newCustomer.lastName.trim() !== "" &&
    formData.newCustomer.email.trim() !== "" &&
    formData.newCustomer.phone.trim() !== ""
  )

  const canConfirm = !!formData.staffId && !!formData.serviceId && !!formData.startAt && !!formData.endAt && isCustomerValid


  return (
    <div className="min-h-screen bg-[url('/bg-1.jpg')]  bg-no-repeat bg-[100%_center]">
    <Navbar/>
    <div className=" flex flex-col justify-center items-center mt-[59px] max-w-[978px] py-[40.5px] px-[97px] mx-auto bg-[linear-gradient(to_bottom_right,#FAFAFC,#FAFAFCb3)]">
      <div className=" max-w-[784px] w-full">
      <h1 className="text-center text-[36px] leading-none mb-4">Book Your <span className="text-[#1D5287] font-bold">Appointment</span></h1>
      <p className="text-center text-sm text-[#0D0D0D] mb-[6px]">Ready to meet with you</p>
      <div className="max-w-6xl w-full mx-auto">
        <div className="w-full">
          <h2 className="font-medium px-1">Select Staff</h2>
          <StaffSelect  value={staffId} onChange={setStaffId} />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 items-end">
          <div className="md:col-span-1 flex flex-col gap-6">
            <Calendar value={date} onChange={d => { setDate(d); setSelectedSlot(null) }} />
          </div>
          <div className="md:col-span-1 p-4 rounded pt-[18px] pl-[45px] pr-0 pb-0 max-h-[345px] overflow-hidden">
            <TimeSlots staffId={staffId} date={date} onSelect={handleSelectSlot} />
          </div>
          <div className="md:col-span-2">
              <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center text-[32px]">Book Appointment</DialogTitle>
                    <DialogDescription className="text-center"  >Selected Slot: {selectedSlot ? `${format(new Date(selectedSlot.startIso), 'PPP p')} - ${format(new Date(selectedSlot.endIso), 'PPP p')}` : "None"}</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Staff</Label>
                        <select
                          className="mt-1 block w-full rounded border px-3 py-2"
                          value={formData.staffId}
                          onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                        >
                          <option value="">Select staff</option>
                          {availableStaff.length === 0 ? (
                            <option value="" disabled>No staff available for this slot</option>
                          ) : (
                            availableStaff.map(s => (
                              <option key={s.id} value={s.id}>{s.displayName}</option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <Label>Service</Label>
                        <select
                          className="mt-1 block w-full rounded border px-3 py-2"
                          value={formData.serviceId}
                          onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        >
                          <option value="">Select service</option>
                          {serviceList.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                      <div>
                        <Label>Customer</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <Input placeholder="Phone" value={formData.newCustomer.phone} onChange={(e) => {
                              // typing a phone should clear any previously selected customer
                              skipNextLookup.current = false
                              setFormData(prev => ({ ...prev, customerId: "", isNewCustomer: true, newCustomer: { ...prev.newCustomer, phone: e.target.value } }))
                              setCustomerSuggestions([])
                            }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePhoneEnter() } }} />
                            {customerLookupLoading && (
                              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            {customerSuggestions.length > 0 && (
                              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded shadow max-h-48 overflow-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
                                {customerSuggestions.map(c => (
                                  <button
                                    type="button"
                                    key={c.id}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-100"
                                    onClick={() => {
                                      // mark to skip the next lookup cycle so our selection doesn't re-trigger suggestions
                                      skipNextLookup.current = true
                                      setTimeout(() => { skipNextLookup.current = false }, 800)

                                      if (c.id === '__add__') {
                                        // user chose to add this phone as a new customer
                                        setFormData(prev => ({
                                          ...prev,
                                          customerId: "",
                                          isNewCustomer: true,
                                          newCustomer: {
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            phone: c.phone ?? prev.newCustomer.phone,
                                            dateOfBirth: "",
                                          },
                                        }))
                                      } else {
                                        // existing customer selected
                                        setFormData(prev => ({
                                          ...prev,
                                          customerId: c.id,
                                          isNewCustomer: false,
                                          newCustomer: {
                                            firstName: c.firstName ?? "",
                                            lastName: c.lastName ?? "",
                                            email: c.email ?? "",
                                            phone: c.phone ?? prev.newCustomer.phone,
                                            dateOfBirth: (c as any).dateOfBirth ?? prev.newCustomer.dateOfBirth,
                                          },
                                        }))
                                      }

                                      setCustomerSuggestions([])
                                      setShowCustomerFields(true)
                                    }}
                                  >
                                    <div className="font-medium">{c.firstName} {c.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{c.id === '__add__' ? "Add: " : ""}{c.phone}</div>
                                  </button>
                                ))}
                                <div className="border-t px-3 py-2 text-sm text-muted-foreground">Select an existing customer or continue typing to create a new one</div>
                              </div>
                            )}
                          </div>
                          
                          {showCustomerFields && (
                            <>
                              <Input placeholder="Email" value={formData.newCustomer.email} onChange={(e) => setFormData({ ...formData, newCustomer: { ...formData.newCustomer, email: e.target.value } })} />
                              <Input placeholder="First name" value={formData.newCustomer.firstName} onChange={(e) => setFormData({ ...formData, newCustomer: { ...formData.newCustomer, firstName: e.target.value } })} />
                              <Input placeholder="Last name" value={formData.newCustomer.lastName} onChange={(e) => setFormData({ ...formData, newCustomer: { ...formData.newCustomer, lastName: e.target.value } })} />
                            </>
                          )}
                        </div>
                      </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        className="resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setBookDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!canConfirm}>Confirm Booking</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>   
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <AppointmentsPageContent />
    </Suspense>
  )
}

