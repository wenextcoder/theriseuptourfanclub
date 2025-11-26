import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    icon?: React.ReactNode
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, icon, placeholder, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)

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
                    {label}
                </label>
                
                {/* Input container */}
                <div className="relative">
                    <input
                        ref={ref}
                        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                        className={cn(
                            "w-full h-12 px-3 bg-transparent",
                            "border-b-2 border-border",
                            "text-base text-foreground",
                            "transition-all duration-300 outline-none",
                            "placeholder:text-muted-foreground/60",
                            "focus:border-primary focus:shadow-[0_1px_0_0_rgba(159,0,1,0.2)]",
                            "hover:border-primary/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            icon && "pr-10",
                            className
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />
                    
                    {icon && (
                        <div className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300",
                            isFocused ? "text-primary" : "text-muted-foreground"
                        )}>
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
