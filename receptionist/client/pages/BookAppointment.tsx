"use client"

import React, { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { useDebounce } from "@/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface Staff {
  id: string
  displayName: string
  title: string | null
}

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  photoUrl?: string | null
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
  const { tenantId } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
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
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    staffId: "",
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
  const skipNextLookup = React.useRef(false)
  const hasCustomerFromNav = React.useRef(false)
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false)

  const location = useLocation()
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const qCid = params.get('customerId')
      if (qCid) {
        ;(async () => {
          try {
            setCustomerLookupLoading(true)
            const { data: customerRes } = await axiosInstance.get(`/customers/${qCid}`)
            const customer = customerRes?.data || customerRes
            if (customer) {
              setFormData(prev => ({
                ...prev,
                customerId: customer.id,
                isNewCustomer: false,
                newCustomer: {
                  firstName: customer.firstName || "",
                  lastName: customer.lastName || "",
                  email: customer.email || "",
                  phone: customer.phone || prev.newCustomer.phone,
                  dateOfBirth: customer.dateOfBirth || "",
                }
              }))
              setShowCustomerFields(true)
            }
          } catch (err) {
            console.error('Failed to fetch customer from query param', err)
          } finally {
            setCustomerLookupLoading(false)
          }
        })()
      }
    } catch (err) {
      // ignore
    }
    const st = (location && (location.state as any)) || {}
    if (!st) return

    // If a customerId is passed, fetch full customer details and prefill
    if (st.customerId) {
      hasCustomerFromNav.current = true
      ;(async () => {
        try {
          setCustomerLookupLoading(true)
          const { data: customerRes } = await axiosInstance.get(`/customers/${st.customerId}`)
          const customer = customerRes?.data || customerRes
          if (customer) {
            setFormData(prev => ({
              ...prev,
              customerId: customer.id,
              isNewCustomer: false,
              newCustomer: {
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phone: customer.phone || prev.newCustomer.phone || st.mobileNumber || "",
                dateOfBirth: customer.dateOfBirth || "",
              }
            }))
            setShowCustomerFields(true)
          }
        } catch (err) {
          console.error('Failed to fetch customer from location state', err)
        } finally {
          setCustomerLookupLoading(false)
        }
      })()
      return
    }

    // If we have a mobileNumber/fullName passed (but no customerId), prefill phone and name for new customer
    if (st.mobileNumber || st.fullName) {
      const nameParts = (st.fullName || "").split(" ")
      const first = nameParts.shift() || ""
      const last = nameParts.join(" ") || ""
      setFormData(prev => ({
        ...prev,
        isNewCustomer: !st.customerExists,
        customerId: st.customerExists ? (st.customerId || "") : "",
        newCustomer: {
          ...prev.newCustomer,
          phone: st.mobileNumber || prev.newCustomer.phone,
          firstName: first,
          lastName: last,
        }
      }))
      setShowCustomerFields(true)
    }
  }, [location.state])

  useEffect(() => {
    const raw = debouncedPhone || ""
    const phone = raw.replace(/\D/g, "")

    // Skip lookup if customer already loaded from navigation state
    if (hasCustomerFromNav.current && formData.customerId) {
      return
    }

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
      toast.error("An unexpected error occurred")
    } finally {
      setLoadingAppointments(false)
      setLoading(false)
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
      // do NOT auto-open the dialog; user will click Continue to proceed
      // setBookDialogOpen(true)
    } catch (err) {
      console.error('Error in handleSelectSlot:', err)
      // setBookDialogOpen(true)
      // keep selection even on error
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    if (isSubmitting) return

    if (!selectedSlot) {
      toast.error("Please select a time slot before continuing")
      return
    }
    const staffForSlot = formData.staffId || (selectedSlot.staffIds && selectedSlot.staffIds[0]) || ""

    // Resolve customer: use selected customerId if present; otherwise create customer from form data
    const payload: any = {
      staffId: staffForSlot,
      serviceId: null,
      startAt: new Date(selectedSlot.startIso).toISOString(),
      endAt: new Date(selectedSlot.endIso).toISOString(),
      price: parseFloat(formData.price) || 0,
      currency: "INR",
      status: "CONFIRMED",
      notes: formData.notes || null,
      customerNotes: formData.customerNotes || null,
      appointmentType: 'PREBOOKING',
    }

    if (!formData.customerId) {
      // Create new customer with provided data or default to walk-in
      const hasCustomerData = formData.newCustomer.firstName || formData.newCustomer.lastName || formData.newCustomer.phone
      
      if (hasCustomerData) {
        // Use the customer data from the form
        payload.customer = {
          firstName: formData.newCustomer.firstName || "Walk-in",
          lastName: formData.newCustomer.lastName || null,
          email: formData.newCustomer.email || null,
          phone: formData.newCustomer.phone || null,
          dateOfBirth: formData.newCustomer.dateOfBirth ? new Date(formData.newCustomer.dateOfBirth).toISOString() : null,
        }
      } else {
        // No customer data provided, create default walk-in customer
        payload.customer = {
          firstName: "Walk-in",
          lastName: null,
        }
      }
    } else {
      payload.customerId = formData.customerId
    }
    try {
      setIsSubmitting(true)
      const response = await axiosInstance.post('/appointments', payload)

      if (!response?.data?.success) {
        toast.error(response?.data?.error || "Failed to book appointment")
        return
      }

      toast.success("Appointment booked successfully")
      setSelectedSlot(null)
      
      // Wait a bit for the database to update before navigating
      await new Promise(resolve => setTimeout(resolve, 500))
      
      fetchAppointments()
      if (formData.isNewCustomer) fetchCustomers()
      navigate('/reception-dashboard')
    } catch (error) {
      console.error('Continue booking error', error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine which staff should be shown in the form's staff dropdown.
  const availableStaff = selectedSlot && Array.isArray(selectedSlot.staffIds) && selectedSlot.staffIds.length > 0
    ? staffList.filter(s => selectedSlot!.staffIds!.includes(s.id))
    : staffList

  return (
    <div className="min-h-screen bg-[url('/bg-1.jpg')]  bg-no-repeat bg-[100%_center]">
    <Navbar/>
    <div className=" flex flex-col justify-center items-center mt-[59px] max-w-[978px] py-[40.5px] px-[97px] mx-auto bg-[linear-gradient(to_bottom_right,#FAFAFC,#FAFAFCb3)]">
      {loading? <BookAppointmentSkeleton/>:(
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
          <div className="md:col-span-1 p-4 rounded pt-[18px] pl-[45px] pr-0 pb-0 max-h-[345px]">
            <div className="mt-4">
              <TimeSlots staffId={staffId} date={date} onSelect={handleSelectSlot} selectedSlotId={selectedSlot?.id} />
            </div>
            <button
              onClick={handleContinue}
              disabled={!selectedSlot || isSubmitting}
              style={{
                marginTop: '12px',
                width: '100%',
                height: '51px',
                padding: '14px 116px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
                border: 'none',
                zIndex: 10,
                cursor: !selectedSlot ? 'not-allowed' : 'pointer',
                opacity: !selectedSlot ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}>

              <span style={{
                color: '#FFF',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}>
                {isSubmitting ? 'Booking...' : 'Continue'}
              </span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <g clipPath="url(#clip0_236_183)">
                  <path d="M0.781372 7.41249C0.834565 7.42112 0.888397 7.4251 0.942258 7.4244L10.1135 7.42441L9.91352 7.51742C9.71804 7.60994 9.54021 7.73586 9.38799 7.88948L6.81614 10.4613C6.47742 10.7847 6.42051 11.3048 6.68127 11.6938C6.98476 12.1082 7.56677 12.1982 7.98126 11.8947C8.01475 11.8702 8.04657 11.8435 8.07648 11.8147L12.7272 7.16396C13.0907 6.80092 13.091 6.21199 12.7279 5.84854C12.7277 5.84831 12.7274 5.84805 12.7272 5.84781L8.07649 1.1971C7.71274 0.83437 7.12382 0.835184 6.76106 1.19893C6.73252 1.22756 6.70586 1.25802 6.68127 1.29011C6.42051 1.67906 6.47742 2.19921 6.81614 2.52255L9.38334 5.09905C9.51981 5.23566 9.67671 5.35021 9.84841 5.43855L10.1275 5.56412L0.993445 5.56412C0.518286 5.54647 0.101408 5.87839 0.0121436 6.34544C-0.070087 6.85251 0.274299 7.33023 0.781372 7.41249Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_236_183">
                    <rect width="13" height="13" fill="white" transform="translate(13 13) rotate(-180)"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
          </div>
        </div>
      </div>
      )}
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

