import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    icon?: React.ReactNode
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, icon, ...props }, ref) => {
        return (
            <div className="relative">
                <Input
                    className={cn("peer pt-6 pb-1 h-14", icon && "pr-10", className)}
                    placeholder=" "
                    ref={ref}
                    {...props}
                />
                <Label
                    className={cn(
                        "absolute left-3 top-4 text-muted-foreground transition-all duration-200 ease-out pointer-events-none origin-[0]",
                        "peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary",
                        "peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary"
                    )}
                >
                    {label}
                </Label>
                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        )
    }
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
