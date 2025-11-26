"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SegmentedDateInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function SegmentedDateInput({
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedDateInputProps) {
  const [month, setMonth] = React.useState("")
  const [day, setDay] = React.useState("")
  const [year, setYear] = React.useState("")

  const monthRef = React.useRef<HTMLInputElement>(null)
  const dayRef = React.useRef<HTMLInputElement>(null)
  const yearRef = React.useRef<HTMLInputElement>(null)

  // Initialize from value prop
  React.useEffect(() => {
    if (value) {
      const m = (value.getMonth() + 1).toString().padStart(2, "0")
      const d = value.getDate().toString().padStart(2, "0")
      const y = value.getFullYear().toString()
      setMonth(m)
      setDay(d)
      setYear(y)
    }
  }, [value])

  // Update parent when all fields are filled
  React.useEffect(() => {
    if (month.length === 2 && day.length === 2 && year.length === 4) {
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)
      const yearNum = parseInt(year)

      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        const date = new Date(yearNum, monthNum - 1, dayNum)
        onChange?.(date)
      }
    } else {
      onChange?.(undefined)
    }
  }, [month, day, year, onChange])

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    
    // Smart validation: if first digit is > 1, prepend 0
    if (val.length === 1 && parseInt(val) > 1) {
      val = "0" + val
      setMonth(val)
      dayRef.current?.focus()
      return
    }
    
    // Validate month range
    if (val.length === 2) {
      const monthNum = parseInt(val)
      if (monthNum < 1 || monthNum > 12) {
        return // Don't update if invalid
      }
    }
    
    setMonth(val)
    
    // Auto-advance to day field
    if (val.length === 2) {
      dayRef.current?.focus()
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    
    // Smart validation: if first digit is > 3, prepend 0
    if (val.length === 1 && parseInt(val) > 3) {
      val = "0" + val
      setDay(val)
      yearRef.current?.focus()
      return
    }
    
    // Validate day range
    if (val.length === 2) {
      const dayNum = parseInt(val)
      if (dayNum < 1 || dayNum > 31) {
        return // Don't update if invalid
      }
    }
    
    setDay(val)
    
    // Auto-advance to year field
    if (val.length === 2) {
      yearRef.current?.focus()
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4)
    setYear(val)
  }

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && month === "") {
      // Stay on month field if empty
      e.preventDefault()
    }
  }

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && day === "") {
      // Move back to month field
      e.preventDefault()
      monthRef.current?.focus()
    }
  }

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && year === "") {
      // Move back to day field
      e.preventDefault()
      dayRef.current?.focus()
    }
  }

  const getInputClassName = (hasValue: boolean) => cn(
    "h-12 w-full text-center text-base font-semibold bg-transparent",
    "border-b-2 border-border rounded-none",
    "transition-all duration-300 outline-none",
    "focus:border-primary focus:shadow-[0_1px_0_0_rgba(159,0,1,0.2)]",
    "hover:border-primary/50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder:text-muted-foreground/60 placeholder:font-normal",
    hasValue && "border-primary/40"
  )

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-3">
        {/* Month */}
        <div className="flex-1 relative">
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={month}
            onChange={handleMonthChange}
            onKeyDown={handleMonthKeyDown}
            disabled={disabled}
            maxLength={2}
            className={getInputClassName(month.length > 0)}
            aria-label="Month"
          />
          <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-muted-foreground font-medium">
            Month
          </div>
        </div>

        <span className="text-xl font-semibold text-muted-foreground select-none">/</span>

        {/* Day */}
        <div className="flex-1 relative">
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            placeholder="DD"
            value={day}
            onChange={handleDayChange}
            onKeyDown={handleDayKeyDown}
            disabled={disabled}
            maxLength={2}
            className={getInputClassName(day.length > 0)}
            aria-label="Day"
          />
          <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-muted-foreground font-medium">
            Day
          </div>
        </div>

        <span className="text-xl font-semibold text-muted-foreground select-none">/</span>

        {/* Year */}
        <div className="flex-[1.5] relative">
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            placeholder="YYYY"
            value={year}
            onChange={handleYearChange}
            onKeyDown={handleYearKeyDown}
            disabled={disabled}
            maxLength={4}
            className={getInputClassName(year.length > 0)}
            aria-label="Year"
          />
          <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-muted-foreground font-medium">
            Year
          </div>
        </div>
      </div>
    </div>
  )
}

