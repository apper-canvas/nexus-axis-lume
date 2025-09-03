import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 active:scale-95",
    secondary: "bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:ring-primary-500 active:scale-95",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-primary-500 active:scale-95",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-primary-500 active:scale-95",
    success: "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-md hover:shadow-lg hover:from-success-600 hover:to-success-700 focus:ring-success-500 active:scale-95",
    danger: "bg-gradient-to-r from-error-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:ring-error-500 active:scale-95"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;