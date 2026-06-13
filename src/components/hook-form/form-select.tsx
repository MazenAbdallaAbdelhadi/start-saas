"use client";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormBase, FormControlFunc } from "./form-base";

export const FormSelect: FormControlFunc<{
  children: React.ReactNode;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}> = ({ children, disabled, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <Select
          {...field}
          onValueChange={props.onValueChange || onChange}
          disabled={disabled}
        >
          <SelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
          >
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormBase>
  );
};
