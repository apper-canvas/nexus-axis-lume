import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    primary: "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 border border-primary-200",
    success: "bg-gradient-to-r from-success-50 to-emerald-100 text-success-800 border border-success-200",
    warning: "bg-gradient-to-r from-warning-50 to-amber-100 text-warning-800 border border-warning-200",
    danger: "bg-gradient-to-r from-error-50 to-red-100 text-error-800 border border-error-200",
    lead: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200",
    prospect: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border border-orange-200",
    customer: "bg-gradient-to-r from-success-50 to-emerald-100 text-success-800 border border-success-200"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;