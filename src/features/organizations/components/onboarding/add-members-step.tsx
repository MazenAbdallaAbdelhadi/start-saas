"use client";

import { useState } from "react";
import { UsersIcon, ArrowRightIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FormInput, FormSelect } from "@/components/hook-form";
import { SelectItem } from "@/components/ui/select";
import { LoadingButton } from "@/components/loading-button";

import { inviteMemberSchema, type IInviteMemberSchema } from "../../schemas";
import { organizationApi } from "../../api/organizations";

interface AddMembersStepProps {
  orgId: string;
  onNext: () => void;
}

export const AddMembersStep = ({ orgId, onNext }: AddMembersStepProps) => {
  const t = useTranslations("Onboarding.addMembers");
  const commonT = useTranslations("Common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<IInviteMemberSchema>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: IInviteMemberSchema) => {
    setIsSubmitting(true);
    try {
      const invitation = await organizationApi.invite({
        ...data,
        organizationId: orgId,
      });
      if (invitation) {
        reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="border-2 shadow-2xl overflow-hidden py-0 bg-card">
        <div className="h-28 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b border-primary/10">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <UsersIcon className="size-8 text-primary" />
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border border-primary/10 p-6 rounded-2xl bg-muted/30">
            <div className="flex flex-col gap-4">
              <FormInput
                name="email"
                control={control}
                label={t("emailLabel")}
                placeholder={t("emailPlaceholder")}
                type="email"
              />
              
              <FormSelect
                name="role"
                control={control}
                label="Role"
              >
                <SelectItem value="member">Member (Standard access to inbox and campaigns)</SelectItem>
                <SelectItem value="admin">Admin (Full control over workspace settings and operations)</SelectItem>
              </FormSelect>
            </div>

            <LoadingButton 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-md" 
              loading={isSubmitting}
            >
              {t("submit")}
            </LoadingButton>
          </form>

          <div className="flex items-center justify-between pt-6 border-t border-primary/5">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary transition-colors h-11 px-6"
              onClick={onNext}
            >
              {t("skip")}
            </Button>
            
            <Button onClick={onNext} className="gap-2 h-11 px-6 shadow-lg shadow-primary/10" variant="outline">
              {commonT("next")}
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
