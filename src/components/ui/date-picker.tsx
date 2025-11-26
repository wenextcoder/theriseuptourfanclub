"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  fromYear = 1940,
  toYear = 2007,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [displayMonth, setDisplayMonth] = React.useState<Date>(
    value || new Date(1990, 0)
  )

  React.useEffect(() => {
    setSelectedDate(value)
    if (value) {
      setDisplayMonth(value)
    }
  }, [value])

  const years = React.useMemo(() => {
    const yearList = []
    for (let year = toYear; year >= fromYear; year--) {
      yearList.push(year)
    }
    return yearList
  }, [fromYear, toYear])

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month)
    const newDate = new Date(displayMonth)
    newDate.setMonth(monthIndex)
    setDisplayMonth(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth)
    newDate.setFullYear(parseInt(year))
    setDisplayMonth(newDate)
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "w-full h-14 justify-start text-left font-normal relative overflow-hidden group",
          !selectedDate && "text-muted-foreground",
          "hover:border-primary/50 hover:bg-primary/5 transition-all duration-300",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="flex-1">
          {selectedDate ? (
            <span className="font-medium text-foreground">
              {format(selectedDate, "MMMM d, yyyy")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        </div>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar Popup */}
          <div className="absolute top-full left-0 mt-2 z-50 w-full min-w-[320px] bg-popover border border-border rounded-xl shadow-2xl p-4 animate-in fade-in-0 zoom-in-95">
            {/* Month and Year Selectors */}
            <div className="flex gap-2 mb-4">
              <Select
                value={months[displayMonth.getMonth()]}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={displayMonth.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              disabled={(date) =>
                date > new Date(toYear, 11, 31) ||
                date < new Date(fromYear, 0, 1)
              }
              initialFocus
            />
          </div>
        </>
      )}
    </div>
  )
}

