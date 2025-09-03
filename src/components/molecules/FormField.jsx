import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error, 
  required = false,
  className,
  children,
  ...inputProps 
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <Label>
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </Label>
      {children || <Input error={error} {...inputProps} />}
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
    </div>
  );
};

export default FormField;