"use client"
import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import TimeSlotSkeleton from "@/skeletons/TimeSlotSkeleton"
import axiosInstance from "@/lib/axios"

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
  onSelect
}: {
  staffId?: string
  date: Date
  onSelect: (slot: Slot) => void
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const isoDate = format(date, "yyyy-MM-dd")

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const generateSlotsFromWindow = (startIso: string, endIso: string, slotLen = 30) => {
      const slots: { startIso: string; endIso: string }[] = []
      const start = new Date(startIso)
      const end = new Date(endIso)
      let cur = new Date(start)

      while (cur.getTime() + slotLen * 60000 <= end.getTime()) {
        const next = new Date(cur.getTime() + slotLen * 60000)
        slots.push({ startIso: cur.toISOString(), endIso: next.toISOString() })
        cur = next
      }
      return slots
    }

    const fetchForStaff = async (sId: string) => {
      try {
        const availRes = await axiosInstance.get(`/staff/${sId}/availability`)
        const windows = availRes.data?.data || availRes.data || []

        const apptRes = await axiosInstance.get(`/appointments`, {
          params: {
            staffId: sId,
            startDate: isoDate,
            endDate: isoDate,
            limit: 1000,
          }
        })
        const appts = apptRes.data?.data || apptRes.data || []
        const taken = new Set(appts.map(a => a.startAt || a.startIso))

        const slots: any[] = []

        const combineDateAndTime = (dateStr: string, timeStr: string) =>
          new Date(`${dateStr}T${timeStr}:00`).toISOString()

        for (const w of windows) {
          try {
            if (w.type === "RECURRING") {
              if (new Date(date).getDay() === w.dayOfWeek) {
                const startIso = combineDateAndTime(isoDate, w.startTime)
                const endIso = combineDateAndTime(isoDate, w.endTime)
                const gen = generateSlotsFromWindow(startIso, endIso)

                for (const s of gen) {
                  slots.push({
                    id: `${s.startIso}|${s.endIso}`,
                    startIso: s.startIso,
                    endIso: s.endIso,
                    available: !taken.has(s.startIso)
                  })
                }
              }
            }

            else if (w.type === "EXCEPTION") {
              const dayStart = new Date(`${isoDate}T00:00:00`)
              const dayEnd = new Date(`${isoDate}T23:59:59.999`)
              const startDateObj = new Date(w.startDate)
              const endDateObj = new Date(w.endDate)

              if (dayEnd >= startDateObj && dayStart <= endDateObj) {
                let startIso: string
                let endIso: string

                if (w.startTime && w.endTime) {
                  startIso = combineDateAndTime(isoDate, w.startTime)
                  endIso = combineDateAndTime(isoDate, w.endTime)
                } else {
                  startIso = (startDateObj > dayStart ? startDateObj : dayStart).toISOString()
                  endIso = (endDateObj < dayEnd ? endDateObj : dayEnd).toISOString()
                }

                const gen = generateSlotsFromWindow(startIso, endIso)
                for (const s of gen) {
                  slots.push({
                    id: `${s.startIso}|${s.endIso}`,
                    startIso: s.startIso,
                    endIso: s.endIso,
                    available: !taken.has(s.startIso)
                  })
                }
              }
            }
            else if (w.type === "BLOCK") {
              continue
            }

            // fallback generic slot generator
            else {
              const start = w.startIso || w.startDate
              const end = w.endIso || w.endDate
              if (!start || !end) continue

              const gen = generateSlotsFromWindow(start, end)
              for (const s of gen) {
                slots.push({
                  id: `${s.startIso}|${s.endIso}`,
                  startIso: s.startIso,
                  endIso: s.endIso,
                  available: !taken.has(s.startIso)
                })
              }
            }
          } catch (err) {
            console.error("Slot processing error", err)
          }
        }

        return { staffId: sId, slots }
      } catch (err) {
        console.error("Error loading staff availability", err)
        return { staffId: sId, slots: [] }
      }
    }

    ;(async () => {
      try {
        if (staffId) {
          const res = await fetchForStaff(staffId)
          if (!mounted) return

          // fetch staff name
          const infoRes = await axiosInstance.get("/staff", {
            params: { isActive: true, limit: 1000 }
          })
          const list = infoRes.data?.data || []
          const staff = list.find((s: any) => s.id === staffId)
          const staffName = staff?.displayName || staff?.name || ""

          const mapped = res.slots.map(s => ({
            ...s,
            staffIds: s.available ? [staffId] : [],
            staffNames: s.available ? [staffName] : []
          }))

          setSlots(mapped)
          return
        }

        const staffRes = await axiosInstance.get("/staff", {
          params: { isActive: true }
        })
        const staffs = staffRes.data?.data || []

        const results = await Promise.all(staffs.map((s: any) => fetchForStaff(s.id)))

        const map = new Map<string, Slot>()

        for (const res of results) {
          const staff = staffs.find((x: any) => x.id === res.staffId)
          const name = staff?.displayName || staff?.name || ""

          for (const sl of res.slots) {
            const key = `${sl.startIso}|${sl.endIso}`
            const existing = map.get(key) || {
              id: key,
              startIso: sl.startIso,
              endIso: sl.endIso,
              available: false,
              staffIds: [],
              staffNames: [],
            }

            if (sl.available) {
              existing.available = true
              existing.staffIds!.push(res.staffId)
              existing.staffNames!.push(name)
            }

            map.set(key, existing)
          }
        }

        setSlots([...map.values()].sort((a, b) =>
          new Date(a.startIso).getTime() - new Date(b.startIso).getTime()
        ))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [staffId, isoDate])

  if (loading) return <TimeSlotSkeleton date={date} />

  return (
    <div className="space-y-3">
      <h3 className="text-[20px] text-center">
        {(() => {
          const formatted = format(date, "EEE, MMMM dd yyyy")
          // Split into date part and year
          const parts = formatted.split(" ")
          const year = parts[parts.length - 1]
          const dateWithoutYear = parts.slice(0, -1).join(" ")
          return (
            <>
              {dateWithoutYear} <span className="text-[#1D5287] font-semibold">{year}</span>
            </>
          )
        })()}
      </h3>

      {/* Wrap the grid in a scrollable container so only the first ~8 slots are visible
          at once (approx. 4 rows x 2 columns). Users can scroll to see additional slots. */}
      <div
        className="max-h-80 overflow-auto focus:outline-none no-scrollbar pb-12"
        tabIndex={0}
        aria-label="Available time slots"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none;} .no-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}`}</style>
        <div className="grid grid-cols-2 gap-[10px]">
          {slots.map(slot => {
          const label =
            `${format(new Date(slot.startIso), "hh:mm")}-${format(
              new Date(slot.endIso),
              "hh:mm a"
            )}`

          const staffLine =
            slot.staffNames?.length
              ? slot.staffNames.slice(0, 2).join(", ") +
                (slot.staffNames.length > 2
                  ? ` +${slot.staffNames.length - 2}`
                  : "")
              : ""

          return (
            <button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => onSelect(slot)}
              className={`px-[26.5px] py-[10px] rounded text-sm text-center hover:text-white ${
                slot.available
                  ? "bg-[#E3F0DA] hover:bg-[#74B446] text-[#344256]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="font-medium">{label}</div>
              {staffLine && (
                <div className="text-[8px]">
                  {staffLine}
                </div>
              )}
            </button>
          )
          })}

          {!loading && slots.length === 0 && (
            <div className="text-sm text-gray-500 col-span-2 text-center">
              No slots available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
