import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Icon, IconProps } from "@/components/ui/icon"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon
  iconSize?: IconProps["size"]
  iconVariant?: IconProps["variant"]
  "aria-label": string
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    iconSize = "default",
    iconVariant = "default",
    className,
    size = "icon",
    variant = "ghost",
    ...props
  }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant={variant}
        className={cn("", className)}
        {...props}
      >
        <Icon
          icon={icon}
          size={iconSize}
          variant={iconVariant}
        />
      </Button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }