"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Phone } from "lucide-react"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    React.useEffect(() => {
      setDisplayValue(formatPhoneNumber(value))
    }, [value])

    const formatPhoneNumber = (phoneNumber: string) => {
      // Remove all non-digit characters
      const cleaned = phoneNumber.replace(/\D/g, "")
      
      // Format as (###) ###-####
      if (cleaned.length === 0) return ""
      if (cleaned.length <= 3) return `(${cleaned}`
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const cleaned = input.replace(/\D/g, "").slice(0, 10) // Max 10 digits
      
      const formatted = formatPhoneNumber(cleaned)
      setDisplayValue(formatted)
      onChange?.(cleaned)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    return (
      <div className="relative w-full">
        {/* Label always at top */}
        <label className={cn(
          "block text-sm font-semibold mb-2 transition-colors duration-200",
          isFocused ? "text-primary" : "text-foreground"
        )}>
          Phone Number
        </label>
        
        {/* Input container */}
        <div className="relative">
          <input
            ref={ref}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="(555) 123-4567"
            maxLength={14} // (###) ###-#### = 14 characters
            className={cn(
              "w-full h-12 px-3 pr-10 bg-transparent",
              "border-b-2 border-border",
              "text-base text-foreground",
              "transition-all duration-300 outline-none",
              "placeholder:text-muted-foreground/60",
              "focus:border-primary focus:shadow-[0_1px_0_0_rgba(159,0,1,0.2)]",
              "hover:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          
          <div className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}>
            <Phone className="h-4 w-4" />
          </div>
        </div>
      </div>
    )
  }
)

PhoneInput.displayName = "PhoneInput"

