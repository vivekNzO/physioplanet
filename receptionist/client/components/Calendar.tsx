import React from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, startOfDay, isBefore, isAfter, max, min } from 'date-fns'
import { ChevronRight, CircleChevronLeft, CircleChevronRight } from 'lucide-react';

export default function Calendar({ value, onChange }: { value: Date; onChange: (d: Date)=>void }) {
  const minDate = startOfDay(new Date())
  const maxDate = addMonths(minDate,1)

  const initialMonth = (()=>{
    const m = startOfMonth(value || new Date())
    if(isBefore(m,startOfMonth(minDate)))return startOfMonth(minDate)
    if(isAfter(m,startOfMonth(maxDate)))return startOfMonth(maxDate)
    return m;
  })()
  const [currentMonth, setCurrentMonth] = React.useState(initialMonth)



  function renderHeader() {
    return (
      <div className="flex items-center justify-between mb-2">
        <button onClick={()=>setCurrentMonth(prev => subMonths(prev, 1))} className="p-1">
          <img className='rotate-180' src='/arrow.png'/>
        </button>
        <div className=" text-xl"> 
                 {(() => {
                  const formatted = format(currentMonth, "MMMM yyyy")
                  const parts = formatted.split(" ")
                  const year = parts[parts.length - 1]
                  const dateWithoutYear = parts.slice(0, -1).join(" ")
                  return (
                    <>
                      {dateWithoutYear} <span className="text-[#1D5287] font-semibold">{year}</span>
                    </>
                  )
                })()}</div>
        <button onClick={()=>setCurrentMonth(prev => addMonths(prev, 1))} className="p-1">
          <img src='/arrow.png'/>
        </button>
      </div>
    )
  }

  function renderDays() {
    // Ensure the calendar grid starts on Monday to match the header
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    const todayStart = startOfDay(new Date())
    const rows = []
    let day = start
    while (day <= end) {
      const week = []
      for (let i=0;i<7;i++) {
        const d = day
        const isPast = isBefore(d, todayStart)
        const isOutofRange = isBefore(d,minDate) || isAfter(d,maxDate)
        week.push(
          <button
            key={d.toString()}
            onClick={() => { if (!isOutofRange) onChange(d) }}
            disabled={isOutofRange}
            aria-disabled={isOutofRange}
            className={`w-10 h-10 rounded ${isSameDay(d, value) ? 'bg-[#74B446] text-white' : isSameMonth(d, currentMonth)&&!isOutofRange ? 'bg-[#74B44633]' : isSameMonth(d, currentMonth) ? 'text-gray-700' : 'text-gray-300'} ${isOutofRange ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            {format(d, 'd')}
          </button>
        )
        day = addDays(day, 1)
      }
      rows.push(<div key={day.toString()} className="flex justify-between mb-1">{week}</div>)
    }
    return rows
  }

  return (
    <div className="bg-white rounded py-[15px] px-[34px] shadow-lg">
      {renderHeader()}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 my-[25px] ">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>
      <div>{renderDays()}</div>
    </div>
  )
}