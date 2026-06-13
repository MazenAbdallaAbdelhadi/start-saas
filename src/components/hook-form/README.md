# React Hook Form Components

This directory contains a suite of reusable, accessible form components built on top of [React Hook Form](https://react-hook-form.com/) (RHF) and our custom `Field` UI component (using Shadcn UI/Radix).

These components are designed to enforce consistent layout, error handling, accessibility, and label management across all forms in the application.

## Overview

Instead of manually wiring up RHF `Controller` components, labels, error messages, and descriptions for every input, use these pre-built components. They automatically handle:

- **State Binding:** Connects directly to RHF via the `control` and `name` props.
- **Accessibility:** Maps IDs, handles `aria-invalid`, and binds labels to inputs automatically.
- **Validation:** Displays form validation errors seamlessly below or above the input depending on the chosen orientation.
- **Layout:** Supports both standard vertical layouts and horizontal layouts out of the box.

## Available Components

- `FormInput`: Standard text inputs (text, email, number, etc.)
- `FormSelect`: Dropdown selection (built on Radix Select)
- `FormTextarea`: Multi-line text inputs
- `FormCheckbox`: Single boolean checkboxes with label accompaniment
- `FormPassword`: Password input with a toggle visibility button
- `RHFField`: A generic/headless wrapper if you need custom UI, but still want the RHF Controller wiring.

## Props API

All of these components share a common set of props derived from `FormBaseProps`:

| Prop | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | `string` | **Yes** | The field path/name to bind in RHF. This must exactly match your schema. |
| `control` | `Control` | **Yes** | The `control` object returned from `useForm()`. |
| `label` | `ReactNode` | **Yes** | The label text or element for the internal `<FieldLabel>`. |
| `description` | `ReactNode` | No | Optional help text displayed as `<FieldDescription>`. |
| `horizontal` | `boolean` | No | If `true`, lays out the label and input side-by-side. Default is vertical. |
| `controlFirst`| `boolean` | No | If `true`, puts the input element *before* the label. Default is `false` (label first). *Note: `FormCheckbox` enables this by default.* |

*Note: You can also pass component-specific props like `placeholder`, `type`, `disabled`, `rows`, etc., which are forwarded to the underlying UI element.*

## Example Usage

Here is a complete example of how to build a form using these components:

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox, 
  FormPassword 
} from "@/components/hook-form";
import { SelectItem } from "@/components/ui/select";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
  bio: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MyForm() {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      bio: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form Submitted", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      {/* Standard Text Input */}
      <FormInput
        name="fullName"
        control={control}
        label="Full Name"
        placeholder="John Doe"
        description="Enter your legal name as it appears on your ID."
      />

      {/* Email Input */}
      <FormInput
        name="email"
        control={control}
        label="Email Address"
        type="email"
        placeholder="john@example.com"
      />

      {/* Select Dropdown */}
      <FormSelect
        name="role"
        control={control}
        label="Account Role"
        placeholder="Select a role..."
      >
        <SelectItem value="admin">Administrator</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </FormSelect>
      
      {/* Textarea */}
      <FormTextarea
        name="bio"
        control={control}
        label="Biography"
        placeholder="Tell us about yourself..."
        rows={4}
      />

      {/* Password Input */}
      <FormPassword
        name="password"
        control={control}
        label="Password"
        placeholder="Must be at least 8 characters"
      />

      {/* Checkbox */}
      <FormCheckbox
        name="acceptTerms"
        control={control}
        label="I accept the Terms and Conditions"
        description="By checking this box, you agree to our policies."
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Best Practices

1. **Avoid `Controller`:** Never manually import `Controller` from `react-hook-form` in feature components. Always use the `Form*` wrappers or `RHFField` if a custom input is absolutely necessary.
2. **Design Consistency:** Let the `FormBase` wrapper handle the error messages and descriptions. Do not manually place `<FieldError>` or `<FieldDescription>` unless building a complex, custom input type.
3. **Checkboxes and Radios:** Use the `FormCheckbox` for single boolean flags. Note that it automatically handles `controlFirst` so the checkbox appears to the left of the label.
4. **Zod Validation:** Always pair these forms with Zod validation. The error messages will automatically populate into the `FieldError` section of the component without any additional manual mapping.
