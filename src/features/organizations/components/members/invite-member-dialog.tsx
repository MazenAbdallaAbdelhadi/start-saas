"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2Icon,
  UserPlusIcon,
  InfoIcon,
  ShieldIcon,
  UsersIcon,
  CheckCircle2Icon,
  CopyIcon,
  LinkIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormInput, FormSelect } from "@/components/hook-form";
import { SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { inviteMemberSchema, IInviteMemberSchema } from "../../schemas";
import { organizationApi } from "../../api/organizations";

interface InviteMemberDialogProps {
  organizationId: string;
}

export const InviteMemberDialog = ({
  organizationId,
}: InviteMemberDialogProps) => {
  const t = useTranslations("Settings.members");
  const tRoles = useTranslations("Settings.members.roles");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string>("");

  const form = useForm<IInviteMemberSchema>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear link states when closing
      setInvitationLink(null);
      setInvitedEmail("");
      reset();
    }
  };

  const onSubmit = async (data: IInviteMemberSchema) => {
    const invitation = await organizationApi.invite({
      ...data,
      organizationId,
    });
    if (invitation && invitation.id) {
      const protocol = window.location.protocol;
      const host = window.location.host;
      const link = `${protocol}//${host}/invite?token=${invitation.id}`;
      setInvitationLink(link);
      setInvitedEmail(data.email);
      router.refresh();
    }
  };

  const copyToClipboard = async () => {
    if (!invitationLink) return;
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success(t("copyLinkToast"));
    } catch (err) {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 font-bold shadow-md hover:shadow-lg transition-all"
          size="sm"
        >
          <UserPlusIcon className="size-4" />
          {t("inviteMember")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "sm:max-w-md border-2 overflow-hidden bg-card transition-all duration-300",
          invitationLink ? "sm:max-w-lg" : "",
        )}
      >
        <div
          className={cn(
            "absolute top-0 inset-x-0 h-1.5 transition-colors duration-500",
            invitationLink
              ? "bg-emerald-500"
              : "bg-linear-to-r from-primary/30 via-primary to-primary/30",
          )}
        />

        {!invitationLink ? (
          <>
            <DialogHeader className="pt-2">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <UserPlusIcon className="size-6 text-primary" />
                {t("inviteMember")}
              </DialogTitle>
              <DialogDescription>{t("inviteDescription")}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <FormInput
                control={control}
                name="email"
                label={t("emailAddress")}
                placeholder={t("emailPlaceholder")}
                description={t("emailDescription")}
              />

              <FormSelect
                control={control}
                name="role"
                label={t("role")}
                placeholder={t("selectRole")}
              >
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-4 text-muted-foreground me-1" />
                    <span>{tRoles("member")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <ShieldIcon className="size-4 me-1" />
                    <span>{tRoles("admin")}</span>
                  </div>
                </SelectItem>
              </FormSelect>

              <div className="bg-muted/30 p-4 rounded-lg flex gap-3 items-start border border-muted">
                <InfoIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>{tRoles("admin")}</strong> {t("permissionsNote")},{" "}
                  {t("permissionsDescription")}
                </div>
              </div>

              <DialogFooter className="pt-4 flex sm:justify-between items-center sm:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="px-6"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="px-8 font-bold shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="size-4 animate-spin me-2" />
                  ) : null}
                  {t("sendInvite")}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20">
              <CheckCircle2Icon className="size-10 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {t("invitationReady")}
              </h3>
              <p className="text-muted-foreground">
                {t("invitationReadyDescription")}{" "}
                <span className="text-foreground font-semibold">
                  {invitedEmail}
                </span>
                .
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
                  <LinkIcon className="size-4 text-muted-foreground" />
                </div>
                <input
                  readOnly
                  value={invitationLink}
                  className="w-full bg-muted/60 h-11 ps-9 pe-24 rounded-xl border-2 border-transparent focus:border-emerald-500/50 outline-none text-sm font-medium transition-all"
                />
                <Button
                  onClick={copyToClipboard}
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-lg font-bold text-xs"
                  size="sm"
                >
                  <CopyIcon className="size-3.5 me-2" />
                  {t("copy")}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {t("linkExpires")}
              </p>
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                className="w-full py-6 font-bold"
                onClick={() => handleOpenChange(false)}
              >
                {t("done")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
