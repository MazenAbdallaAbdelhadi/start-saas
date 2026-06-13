"use client";

import * as React from "react";
import { useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { LoadingButton } from "@/components/loading-button";

export interface ActionButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "asChild"
> {
  /**
   * The action to execute when confirmed
   * Can be synchronous or asynchronous
   */
  onAction: () => void | Promise<void>;

  /**
   * Content of the trigger button
   */
  children: React.ReactNode;

  /**
   * Dialog title
   * @default "Are you sure?"
   */
  title?: string;

  /**
   * Dialog description text
   * @default "This action cannot be undone."
   */
  description?: string | React.ReactNode;

  /**
   * Confirm button text
   * @default "Continue"
   */
  confirmText?: string;

  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Variant for the confirm button
   * @default Same as trigger button variant
   */
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];

  /**
   * Whether to show confirmation dialog
   * If false, action executes immediately on click
   * @default true
   */
  requireConfirmation?: boolean;

  /**
   * Custom className for the dialog content
   */
  dialogClassName?: string;

  /**
   * Callback fired when action completes successfully
   */
  onSuccess?: () => void;

  /**
   * Callback fired when action fails
   */
  onError?: (error: unknown) => void;

  /**
   * Custom icon to show before confirm button text
   */
  confirmIcon?: React.ReactNode;

  /**
   * Whether to close dialog on success
   * @default true
   */
  closeOnSuccess?: boolean;
}

export function ActionButton({
  onAction,
  children,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  confirmVariant,
  requireConfirmation = true,
  dialogClassName,
  onSuccess,
  onError,
  confirmIcon,
  closeOnSuccess = true,
  variant = "default",
  disabled,
  className,
  ...buttonProps
}: ActionButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAction = React.useCallback(async () => {
    startTransition(async () => {
      try {
        await onAction();

        // Call success callback if provided
        onSuccess?.();

        // Close dialog on success if enabled
        if (closeOnSuccess) {
          setOpen(false);
        }
      } catch (error) {
        // Call error callback if provided
        onError?.(error);

        // Keep dialog open on error so user can see what happened
        console.error("Action failed:", error);
      }
    });
  }, [onAction, onSuccess, onError, closeOnSuccess]);

  const handleTriggerClick = React.useCallback(() => {
    if (!requireConfirmation) {
      // Execute action immediately without confirmation
      handleAction();
    } else {
      // Open confirmation dialog
      setOpen(true);
    }
  }, [requireConfirmation, handleAction]);

  // Helper to get destructive button classes for dark theme compatibility
  const getDestructiveClasses = (isConfirmButton = false) => {
    if (
      variant === "destructive" ||
      (isConfirmButton && confirmVariant === "destructive")
    ) {
      return "bg-destructive/20 hover:bg-destructive/25 text-destructive/90 dark:bg-destructive/15 dark:hover:bg-destructive/20 dark:text-destructive/90 border dark:border-destructive/40";
    }
    return "";
  };

  // If no confirmation required, just render a loading button
  if (!requireConfirmation) {
    return (
      <LoadingButton
        onClick={handleTriggerClick}
        loading={isPending}
        disabled={disabled || isPending}
        variant={variant}
        className={`${getDestructiveClasses()} ${className || ""}`}
        {...buttonProps}
      >
        {children}
      </LoadingButton>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <LoadingButton
          loading={isPending}
          disabled={disabled}
          variant={variant}
          className={`${getDestructiveClasses()} ${className || ""}`}
          {...buttonProps}
        >
          {children}
        </LoadingButton>
      </AlertDialogTrigger>

      <AlertDialogContent className={dialogClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription asChild>
              <div>{description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent default dialog close
              handleAction();
            }}
            disabled={isPending}
            asChild
          >
            <LoadingButton
              loading={isPending}
              variant={confirmVariant ?? variant}
              className={getDestructiveClasses(true)}
            >
              {confirmIcon && !isPending && confirmIcon}
              <span>{confirmText}</span>
            </LoadingButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
