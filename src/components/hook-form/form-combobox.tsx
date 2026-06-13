import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RHFField } from "./rhf-field";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface FormComboboxProps {
  name: string;
  control: any;
  label?: string;
  description?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  emptyMessage?: string;
  disabled?: boolean;
}

export function FormCombobox({
  name,
  control,
  label,
  description,
  placeholder = "Select option...",
  options,
  emptyMessage = "No items found.",
  disabled = false,
}: FormComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <RHFField name={name} control={control}>
      {(field, fieldState) => {
        // Find selected item label for trigger display
        const targetValue = field.value || "";
        const selectedOption = options.find((opt) => opt.value === targetValue);

        return (
          <div className="space-y-2">
            {label && (
              <FieldLabel htmlFor={name} className="flex-1">
                {label}
              </FieldLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={field.id}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between overflow-hidden",
                    !selectedOption && "text-muted-foreground",
                    fieldState.invalid &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                  </span>
                  <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command className="border-0 ring-0">
                  <div className="flex items-center border-b px-3">
                    <Search className="me-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search..."
                      className="flex-1 h-9 border-0 ring-0 focus-visible:ring-0 px-0 outline-none w-full"
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm">
                      {emptyMessage}
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label} // CommandItem matches by `value` internally which maps to this prop
                          onSelect={() => {
                            field.onChange(
                              option.value === targetValue ? "" : option.value,
                            );
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "me-2 h-4 w-4",
                              targetValue === option.value
                                ? "opacity-100 text-primary"
                                : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[{ message: fieldState.error?.message }]} />
          </div>
        );
      }}
    </RHFField>
  );
}
