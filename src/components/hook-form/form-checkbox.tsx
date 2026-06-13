"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { FormBase, FormControlFunc } from "./form-base";

export const FormCheckbox: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => (
        <Checkbox {...field} checked={value} onCheckedChange={onChange} />
      )}
    </FormBase>
  );
};
