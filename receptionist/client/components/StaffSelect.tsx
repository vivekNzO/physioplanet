"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import axiosInstance from "@/lib/axios"

type Staff = {
  id: string
  displayName: string
  title: string | null
}

export default function StaffSelect({ value, onChange }: { value?: string; onChange: (id?: string) => void }) {
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        let mounted = true
        const fetchStaff = async () => {
            setLoading(true)
            try {
                const {data} = await axiosInstance.get("/staff",{params:{isActive:true}})
                setStaff(data?.data || [])
            }
             catch (error) {
                console.error("Error fetching staff:", error)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchStaff()
        return () => { mounted = false }
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return staff
        return staff.filter(s => (s.displayName || "").toLowerCase().includes(q) || (s.title || "").toLowerCase().includes(q))
    }, [staff, query])

    return (
        <div className="w-full flex items-center gap-2 ">
            <div className="flex-1">
                <Select  value={value ?? ""} onValueChange={(val) => onChange(val || undefined)} onOpenChange={(o) => {
                    setOpen(o)
                    if (o) {
                        // focus the search input once the dropdown is open
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }
                }}>
                    <SelectTrigger className="w-full py-[15px] px-8 h-[51px] outline-none focus:outline-none focus:ring-0 focus:border-transparent">
                        <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex-1 text-left">
                                <SelectValue placeholder="Select staff" />
                            </div>
                            {value ? (
                                <button
                                    type="button"
                                    aria-label="Clear staff selection"
                                    onClick={(e) => {
                                        // prevent the trigger from toggling when clearing
                                        e.stopPropagation()
                                        onChange(undefined)
                                        setQuery("")
                                    }}
                                    className="p-1 rounded hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ) : null}
                        </div>
                    </SelectTrigger>

                    <SelectContent>
                        <div className="p-2">
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={loading ? "Loading staff..." : "Search staff..."}
                                className="w-full rounded border px-2 py-1 text-sm"
                            />
                        </div>

                        {loading && <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>}

                        {!loading && filtered.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No matching staff</div>
                        )}

                        {!loading && filtered.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.displayName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}