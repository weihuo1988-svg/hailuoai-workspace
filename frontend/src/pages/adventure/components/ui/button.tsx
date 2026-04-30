import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-warm text-primary-foreground shadow-doodle hover:shadow-doodle-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-doodle bg-card text-foreground hover:bg-muted",
        secondary: "bg-gradient-sky text-secondary-foreground shadow-doodle hover:shadow-doodle-lg hover:-translate-y-0.5",
        ghost: "text-foreground hover:bg-muted",
        link: "text-adventure-orange underline-offset-4 hover:underline",
        adventure: "bg-gradient-forest text-accent-foreground shadow-doodle hover:shadow-doodle-lg hover:-translate-y-0.5 font-display",
        gold: "bg-gradient-gold text-foreground shadow-doodle hover:shadow-doodle-lg hover:-translate-y-0.5 font-display",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
        xl: "h-16 rounded-2xl px-10 text-lg font-display",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
