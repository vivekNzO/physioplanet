"use client"
import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import TimeSlotSkeleton from "@/skeletons/TimeSlotSkeleton"
import axiosInstance from "@/lib/axios"
import { formatTimeInIst12Hour } from "@/utils/dateUtils"

export type Slot = {
  id: string
  startIso: string
  endIso: string
  available: boolean
  staffIds?: string[]
  staffNames?: string[]
}

export default function TimeSlots({
  staffId,
  date,
  onSelect,
  selectedSlotId,
  excludeAppointmentId,
  excludeSlots = [],
}: {
  staffId?: string
  date: Date
  onSelect: (slot: Slot) => void
  selectedSlotId?: string
  excludeAppointmentId?: string
  excludeSlots?: { startIso: string; endIso?: string }[]
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  const isoDate = format(date, "yyyy-MM-dd")

  useEffect(() => {
    // 🔑 DO NOTHING until staffId exists
    if (!staffId) return

    let mounted = true
    setLoading(true)
    setSlots([])

    const fetchForStaff = async (sId: string) => {
      try {
        // Use central availability endpoint which builds slots from staff availability and excludes booked appointments
        // Add timestamp to prevent caching
        const params: any = { 
          staffId: sId, 
          date: isoDate,
          _t: Date.now() // Cache buster
        }
        if (excludeAppointmentId) {
          params.excludeAppointmentId = excludeAppointmentId
        }
        const res = await axiosInstance.get('/appointments/available', { params })
        const slotsData = res.data?.slots || res.data || []

        // Map into UI slot shape, attach staff meta
        const staffRes = await axiosInstance.get('/staff', { params: { isActive: true, limit: 1000 } })
        const staff = (staffRes.data?.data || []).find((s: any) => s.id === sId)
        const staffName = staff?.displayName || ''

        return (slotsData || []).map((s: any) => ({
          id: s.id || `${s.startIso}|${s.endIso}`,
          startIso: s.startIso,
          endIso: s.endIso,
          available: !!s.available,
          staffIds: s.available ? [sId] : [],
          staffNames: s.available ? [staffName] : [],
        }))
      } catch (e) {
        console.error("Availability error", e)
        return []
      }
    }

    ;(async () => {
      try {
        const staffSlots = await fetchForStaff(staffId)
        if (!mounted) return

        setSlots(staffSlots)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [staffId, isoDate, date, excludeAppointmentId])

  if (loading) return <TimeSlotSkeleton date={date} />

  // Helper function to check if a slot is in the past
  const isSlotPast = (slot: Slot): boolean => {
    const now = new Date()
    const slotStart = new Date(slot.startIso)
    return slotStart < now
  }

  const availableSlots = slots
    .filter(slot => slot.available && !isSlotPast(slot))
    .filter(slot => {
      if (!excludeSlots.length) return true
      return !excludeSlots.some(ex => {
        const matchStart = ex.startIso && slot.startIso === ex.startIso
        const matchEnd = ex.endIso ? slot.endIso === ex.endIso : false
        return matchStart || matchEnd
      })
    })

  return (
    <div className="space-y-3 max-h-[250px] overflow-hidden">
      <h3 className="text-[20px] text-center">
        {(() => {
          const formatted = format(date, "EEE, MMMM dd yyyy")
          const parts = formatted.split(" ")
          const year = parts.pop()
          return (
            <>
              {parts.join(" ")}{" "}
              <span className="text-[#1D5287] font-semibold">{year}</span>
            </>
          )
        })()}
      </h3>

      <div className="max-h-[260px] overflow-auto no-scrollbar pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="grid grid-cols-2 gap-[10px]">
          {availableSlots.map(slot => {
            // Format UTC times to IST for display, show am/pm only once at the end
            const startDate = new Date(slot.startIso);
            const endDate = new Date(slot.endIso);

            const startHour = startDate.getHours() % 12 || 12;
            const startMin = startDate.getMinutes().toString().padStart(2, '0');
            const endHour = endDate.getHours() % 12 || 12;
            const endMin = endDate.getMinutes().toString().padStart(2, '0');
            const ampm = endDate.getHours() < 12 ? 'am' : 'pm';

            const label = `${startHour}:${startMin}–${endHour}:${endMin} ${ampm}`.toLocaleUpperCase();

            return (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className={`px-[26.5px] py-[20px] rounded text-sm text-center ${
                  slot.id === selectedSlotId 
                    ? 'bg-[#74B446] text-white ring-2 ring-[#74B446]/40 whitespace-nowrap' 
                    : 'bg-[#E3F0DA] hover:bg-[#74B446] hover:text-white text-[#344256] whitespace-nowrap'
                }`}
              >
                <div className="font-medium whitespace-nowrap">{label}</div>
                {/* {slot.staffNames?.length ? (
                  <div className="text-[8px] whitespace-nowrap">
                    {slot.staffNames.join(", ")}
                  </div>
                ) : null} */}
              </button>
            )
          })}

          {!loading && availableSlots.length === 0 && (
            <div className="col-span-2 text-center text-sm text-gray-500">
              No slots available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
