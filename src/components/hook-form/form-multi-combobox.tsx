import React, { useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface FormMultiComboboxProps {
  name: string;
  control: any;
  label?: string;
  description?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  emptyMessage?: string;
  disabled?: boolean;
}

export function FormMultiCombobox({
  name,
  control,
  label,
  description,
  placeholder = "Select options...",
  options,
  emptyMessage = "No items found.",
  disabled = false,
}: FormMultiComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <RHFField name={name} control={control}>
      {(field, fieldState) => {
        // Find selected item labels
        const targetValues: string[] = Array.isArray(field.value)
          ? field.value
          : [];
        const selectedOptions = options.filter((opt) =>
          targetValues.includes(opt.value),
        );

        const handleSelect = (val: string) => {
          if (targetValues.includes(val)) {
            field.onChange(targetValues.filter((v) => v !== val));
          } else {
            field.onChange([...targetValues, val]);
          }
        };

        const handleClear = () => {
          field.onChange([]);
        };

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
                    targetValues.length === 0 && "text-muted-foreground",
                    fieldState.invalid &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <span className="truncate">
                    {targetValues.length > 0 ? (
                      <div className="flex gap-1 items-center">
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 h-5 rounded-sm"
                        >
                          {targetValues.length} selected
                        </Badge>
                        <span className="text-xs truncate ms-1 text-muted-foreground font-normal">
                          {selectedOptions.map((o) => o.label).join(", ")}
                        </span>
                      </div>
                    ) : (
                      placeholder
                    )}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {targetValues.length > 0 && (
                      <div
                        role="button"
                        className="opacity-50 hover:opacity-100 px-1 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <ChevronsUpDown className="ms-1 h-4 w-4 opacity-50" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command className="border-0 ring-0 filter-none">
                  <div className="flex items-center border-b px-3">
                    <Search className="me-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search multiple options..."
                      className="flex-1 h-9 border-0 ring-0 focus-visible:ring-0 px-0 outline-none w-full"
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm">
                      {emptyMessage}
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => {
                        const isSelected = targetValues.includes(option.value);
                        return (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={() => handleSelect(option.value)}
                            className="cursor-pointer"
                            onMouseDown={(e) => {
                              // Prevents input blur/close on multiselect
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <div
                              className={cn(
                                "me-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <Check className="h-3 w-3 text-current" />
                            </div>
                            {option.label}
                          </CommandItem>
                        );
                      })}
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
