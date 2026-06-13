"use client";
import { Textarea } from "@/components/ui/textarea";

import { FormBase, FormControlFunc } from "./form-base";

export const FormTextarea: FormControlFunc<{
  placeholder?: string;
  rows?: number;
  className?: string;
}> = ({ rows = 5, placeholder, className, ...props }) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Textarea
          {...field}
          placeholder={placeholder}
          rows={rows}
          className={className}
        />
      )}
    </FormBase>
  );
};
