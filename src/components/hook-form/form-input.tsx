"use client";
import { Input } from "@/components/ui/input";

import { FormBase, FormControlFunc } from "./form-base";

export const FormInput: FormControlFunc<{
  type?: React.ComponentProps<"input">["type"];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}> = ({ type = "text", placeholder, disabled, className, ...props }) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Input 
          type={type} 
          placeholder={placeholder} 
          disabled={disabled} 
          className={className} 
          {...field} 
        />
      )}
    </FormBase>
  );
};
