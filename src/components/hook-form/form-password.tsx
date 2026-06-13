"use client";
import { PasswordInput } from "@/components/password-input";

import { FormBase, FormControlFunc } from "./form-base";

export const FormPassword: FormControlFunc<{ placeholder?: string }> = ({
  placeholder,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => <PasswordInput placeholder={placeholder} {...field} />}
    </FormBase>
  );
};
