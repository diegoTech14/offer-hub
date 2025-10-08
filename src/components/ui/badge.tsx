import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-800",
        success:
          "border-transparent bg-green-100 text-green-800",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800",
        error:
          "border-transparent bg-red-100 text-red-800",
        pending:
          "border-transparent bg-blue-100 text-blue-800",
        info:
          "border-transparent bg-purple-100 text-purple-800",
      },
      dot: {
        true: "pl-2",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, dot }), className)} {...props}>
      {dot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === "success" && "bg-green-600",
          variant === "warning" && "bg-yellow-600",
          variant === "error" && "bg-red-600",
          variant === "pending" && "bg-blue-600",
          variant === "info" && "bg-purple-600",
          variant === "default" && "bg-gray-600",
        )} />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };