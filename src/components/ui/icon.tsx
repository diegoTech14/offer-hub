import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const iconVariants = cva(
  "shrink-0",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-10 w-10",
      },
      variant: {
        default: "text-current",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        destructive: "text-destructive",
        success: "text-green-600",
        warning: "text-yellow-600",
        accent: "text-accent-foreground",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface IconProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, className, size, variant, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, variant }), className)}
        {...props}
      />
    )
  }
)
Icon.displayName = "Icon"

export { Icon, iconVariants }