"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BuildingIcon,
  PencilIcon,
  Loader2Icon,
  SaveIcon,
  AtSignIcon,
} from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RHFField } from "@/components/hook-form";

import { organizationApi } from "../../api/organizations";

const orgUpdateSchema = z.object({
  name: z.string().min(2, "Name is too short"),
});

type IOrgUpdateSchema = z.infer<typeof orgUpdateSchema>;

interface OrganizationSettingsFormProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  canEdit?: boolean;
}

export const OrganizationSettingsForm = ({
  organization,
  canEdit = true,
}: OrganizationSettingsFormProps) => {
  const t = useTranslations("Settings.organization.form");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<IOrgUpdateSchema>({
    resolver: zodResolver(orgUpdateSchema),
    defaultValues: {
      name: organization.name,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = form;

  const onSubmit = async (data: IOrgUpdateSchema) => {
    if (!canEdit) return;

    const success = await organizationApi.update({
      name: data.name,
      organizationId: organization.id,
    });

    if (success) {
      setIsEditing(false);
      router.refresh();
    }
  };

  return (
    <Card className="border-2 shadow-sm overflow-hidden py-0">
      <CardHeader className="bg-muted/10 p-6">
        <CardTitle className="text-xl font-bold">
          {t("generalInfoTitle")}
        </CardTitle>
        <CardDescription>{t("generalInfoDescription")}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RHFField name="name" control={control}>
              {(field, fieldState) => (
                <Field className="group">
                  <FieldLabel htmlFor={field.name}>
                    {t("organizationNameLabel")}
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup className="group">
                      <FieldContent>
                        <InputGroupInput {...field} disabled={!isEditing} />
                        <FieldError />
                      </FieldContent>

                      {!isEditing && canEdit && (
                        <InputGroupAddon
                          align={"inline-end"}
                          onClick={() => setIsEditing(true)}
                        >
                          <PencilIcon className="size-4 group-hover:text-primary transition-colors" />
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            </RHFField>

            <Field>
              <FieldLabel htmlFor="slug">
                {t("organizationSlugLabel")}
              </FieldLabel>
              <FieldContent>
                <InputGroup className="group">
                  <InputGroupAddon>
                    <AtSignIcon />
                  </InputGroupAddon>
                  <InputGroupInput value={organization.slug} disabled />
                </InputGroup>
                <FieldDescription className="text-xs">
                  {t("organizationSlugDescription")}
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              {t("organizationLogoSectionTitle")}
            </label>
            <div className="flex items-center gap-6 p-4 rounded-xl border-2 border-dashed bg-muted/20">
              <div className="size-20 rounded-2xl bg-primary/10 border-2 border-primary/5 flex items-center justify-center">
                <BuildingIcon className="size-10 text-primary opacity-30" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-bold">
                  {t("organizationLogoTitle")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("organizationLogoDescription")}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-primary font-bold"
                >
                  {t("uploadLogoButton")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {isEditing && (
          <CardFooter className="bg-muted/10 p-4 px-8 border-t flex justify-end gap-3 animate-in slide-in-from-bottom-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              {t("cancelButton")}
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-md h-10 px-8"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting && (
                <Loader2Icon className="size-4 animate-spin me-2" />
              )}
              <SaveIcon className="size-4 me-2" />
              {t("saveChangesButton")}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
};
