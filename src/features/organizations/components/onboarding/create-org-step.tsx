"use client";

import { useState, useEffect } from "react";
import { ArrowLeftIcon, Building2Icon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import slugify from "slugify";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FormInput } from "@/components/hook-form";
import { LoadingButton } from "@/components/loading-button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { createOrganizationSchema, type ICreateOrganizationSchema } from "../../schemas";
import { organizationApi } from "../../api/organizations";

interface CreateOrgStepProps {
  onBack: () => void;
  onNext: (orgId: string) => void;
}

export const CreateOrgStep = ({ onBack, onNext }: CreateOrgStepProps) => {
  const t = useTranslations("Onboarding.createOrg");
  const trpc = useTRPC();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugDirty, setIsSlugDirty] = useState(false);
  const [debouncedSlug, setDebouncedSlug] = useState("");

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ICreateOrganizationSchema>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugDirty && nameValue) {
      const generatedSlug = slugify(nameValue, { lower: true, strict: true });
      if (generatedSlug !== slugValue) {
        setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [nameValue, isSlugDirty, setValue, slugValue]);

  // Detect manual edits to the slug
  useEffect(() => {
    if (slugValue && nameValue) {
      const expectedSlug = slugify(nameValue, { lower: true, strict: true });
      // If the user types something that doesn't match the auto-gen, mark as dirty
      if (slugValue !== expectedSlug && slugValue !== "") {
        setIsSlugDirty(true);
      }
    }
    // If user clears everything, maybe we want to resume auto-gen? 
    // Usually better to keep it dirty once they've touched it.
  }, [slugValue, nameValue]);

  // Debounce slug for availability check
  useEffect(() => {
    if (!slugValue) {
      setDebouncedSlug("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSlug(slugValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [slugValue]);

  // Check slug availability
  const { data: availability, isLoading: isChecking } = useQuery({
    ...trpc.organizations.checkSlug.queryOptions({ slug: debouncedSlug }),
    enabled: debouncedSlug.length >= 2 && !errors.slug,
    staleTime: 30000,
  });

  const onSubmit = async (data: ICreateOrganizationSchema) => {
    if (availability && !availability.available) return;
    
    setIsSubmitting(true);
    try {
      const org = await organizationApi.create(data, router, { redirect: false });
      if (org) {
        onNext(org.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slugFeedback = () => {
    if (errors.slug) return null;
    if (!slugValue || slugValue.length < 2) return null;
    
    if (isChecking) {
      return (
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground animate-pulse">
          <Loader2Icon className="size-3 animate-spin" />
          {t("slugChecking")}
        </span>
      );
    }
    
    if (availability?.available) {
      return (
        <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-bold uppercase tracking-tight">
          <CheckIcon className="size-3" />
          {t("slugAvailable")}
        </span>
      );
    }
    
    if (availability && !availability.available) {
      return (
        <span className="flex items-center gap-1.5 text-[11px] text-destructive font-bold uppercase tracking-tight">
          <XIcon className="size-3" />
          {t("slugTaken")}
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6 -ms-4 gap-2 text-muted-foreground hover:text-primary transition-colors"
        onClick={onBack}
      >
        <ArrowLeftIcon className="size-4" />
        {t("back")}
      </Button>

      <Card className="border-2 shadow-2xl overflow-hidden py-0 bg-card">
        <div className="h-28 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b border-primary/10">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Building2Icon className="size-8 text-primary" />
          </div>
        </div>

        <CardHeader className="text-center pb-2 pt-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-base text-balance mt-2 px-4">
            {t("description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 px-6 md:px-10 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              name="name"
              control={control}
              label={t("nameLabel")}
              placeholder={t("namePlaceholder")}
            />

            <FormInput
              name="slug"
              control={control}
              label={t("slugLabel")}
              placeholder={t("slugPlaceholder")}
              description={
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground">{t("slugDescription")}</span>
                  {slugFeedback()}
                </div>
              }
            />

            <LoadingButton 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" 
              loading={isSubmitting}
              disabled={availability?.available === false}
            >
              {t("submit")}
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
