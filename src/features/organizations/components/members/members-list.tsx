"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  MoreHorizontalIcon,
  ShieldCheckIcon,
  MailIcon,
  ClockIcon,
  LinkIcon,
  XIcon,
  UserMinusIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/action-button";

import { organizationApi } from "../../api/organizations";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string | "owner" | "admin" | "member";
  image?: string;
  status?: "active" | "pending";
}

interface MembersTableProps {
  members: Member[];
  invitations?: { id: string; email: string; role: string; status: string }[];
  currentMemberId?: string;
  currentUserRole?: "owner" | "admin" | "member";
}

export const MembersTable = ({
  members,
  invitations = [],
  currentMemberId,
  currentUserRole,
}: MembersTableProps) => {
  const t = useTranslations("Settings.members");
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelInvite = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      const success = await organizationApi.cancelInvitation(invitationId);
      if (success) {
        router.refresh();
      }
    } finally {
      setCancellingId(null);
    }
  };

  const copyInviteLink = (invitationId: string) => {
    const link = `${window.location.protocol}//${window.location.host}/invite?token=${invitationId}`;
    navigator.clipboard.writeText(link);
    toast.success(t("copyLinkToast"));
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await organizationApi.removeMember(memberId);
    if (success) {
      router.refresh();
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    if (role === "owner" || role === "admin" || role === "member") {
      const success = await organizationApi.updateMemberRole(memberId, role);
      if (success) {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* ALL MEMBERS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheckIcon className="size-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">
            {t("activeMembers")}
          </h2>
          <Badge
            variant="secondary"
            className="ms-1 h-5.5 px-2 rounded-md font-bold"
          >
            {members.length}
          </Badge>
        </div>

        <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-5 py-4 w-[40%] text-foreground font-bold text-sm">
                  {t("member")}
                </TableHead>
                <TableHead className="px-5 py-4 text-foreground font-bold text-sm">
                  {t("role")}
                </TableHead>
                <TableHead className="px-5 py-4 text-foreground font-bold text-sm">
                  {t("status")}
                </TableHead>
                <TableHead className="px-5 py-4 text-right pe-6 text-foreground font-bold text-sm">
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isSelf = member.id === currentMemberId;
                const isTargetOwner = member.role === "owner";
                // Current user can only edit role if they aren't editing themselves,
                // AND either they are an owner, or the target is not an owner.
                const canEditRole =
                  !isSelf && (currentUserRole === "owner" || !isTargetOwner);
                const canRemove =
                  !isSelf && (currentUserRole === "owner" || !isTargetOwner);
                // Only an owner can promote someone to owner
                const canMakeOwner = currentUserRole === "owner";

                return (
                  <TableRow
                    key={member.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border-2 border-background shadow-xs">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs uppercase">
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                          {member.image && <AvatarImage src={member.image} />}
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate max-w-[200px] leading-tight text-sm">
                            {member.name}{" "}
                            {isSelf && (
                              <span className="text-muted-foreground font-normal ms-1">
                                {t("you")}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wide">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
                        <span className="text-emerald-500">{t("active")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right pe-6">
                      {!canEditRole && !canRemove ? (
                        <span className="text-xs text-muted-foreground italic me-2">
                          {t("protected")}
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 group-hover:bg-background"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 border-2 shadow-xl p-2"
                          >
                            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              {t("memberSettings")}
                            </DropdownMenuLabel>

                            {canEditRole && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="gap-2 rounded-md text-sm">
                                    <ShieldCheckIcon className="size-4" />{" "}
                                    {t("changeRole")}
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="w-40 shadow-xl border-2">
                                      <DropdownMenuRadioGroup
                                        value={member.role}
                                        onValueChange={(newRole) =>
                                          handleUpdateRole(member.id, newRole)
                                        }
                                      >
                                        <DropdownMenuRadioItem
                                          value="owner"
                                          className="font-medium"
                                          disabled={!canMakeOwner}
                                        >
                                          👑 {t("roles.owner")}
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem
                                          value="admin"
                                          className="font-medium"
                                        >
                                          🛡️ {t("roles.admin")}
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem
                                          value="member"
                                          className="font-medium"
                                        >
                                          👤 {t("roles.member")}
                                        </DropdownMenuRadioItem>
                                      </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              </>
                            )}

                            {canRemove && (
                              <>
                                <DropdownMenuSeparator />
                                <div className="p-0">
                                  <ActionButton
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium border-none shadow-none text-sm"
                                    title={`${t("removeMemberConfirm")} ${member.name}?`}
                                    description={`${t("removeMemberDescription")} ${member.name} ${t("fromOrganization")}`}
                                    confirmText={t("confirmRemoveMember")}
                                    confirmVariant="destructive"
                                    onAction={() =>
                                      handleRemoveMember(member.id)
                                    }
                                  >
                                    <UserMinusIcon className="size-4" />{" "}
                                    {t("removeMember")}
                                  </ActionButton>
                                </div>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* PENDING INVITATIONS SECTION */}
      {invitations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-muted-foreground">
            <MailIcon className="size-5" />
            <h2 className="text-xl font-bold tracking-tight">
              {t("pendingInvitations")}
            </h2>
            <Badge
              variant="outline"
              className="ms-1 h-5.5 px-2 rounded-md font-bold"
            >
              {invitations.length}
            </Badge>
          </div>

          <div className="rounded-xl border-2 border-dashed bg-muted/20 overflow-hidden">
            <Table>
              <TableHeader className="text-muted-foreground/70 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-5 py-4 w-[40%] text-xs uppercase tracking-widest h-auto">
                    {t("recipient")}
                  </TableHead>
                  <TableHead className="px-5 py-4 text-xs uppercase tracking-widest h-auto">
                    {t("assignedRole")}
                  </TableHead>
                  <TableHead className="px-5 py-4 text-xs uppercase tracking-widest h-auto">
                    {t("status")}
                  </TableHead>
                  <TableHead className="px-5 py-4 text-right pe-6 text-xs uppercase tracking-widest h-auto">
                    {t("manage")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow
                    key={invite.id}
                    className="group hover:bg-transparent border-none"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted border flex items-center justify-center shadow-xs">
                          <MailIcon className="size-4 text-muted-foreground" />
                        </div>
                        <span className="font-semibold text-foreground/80 truncate max-w-[200px] text-sm">
                          {invite.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <RoleBadge role={invite.role} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/80">
                        <ClockIcon className="size-3.5" />
                        <span>{t("pending")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right pe-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => copyInviteLink(invite.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 font-bold text-xs bg-background gap-1.5 border-2 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <LinkIcon className="size-3" />
                          {t("copyLink")}
                        </Button>
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          className="h-8 font-bold text-xs bg-muted/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 border-none shadow-none"
                          title={t("cancelInvitationConfirm")}
                          description={`${t("cancelInvitationDescription")} ${invite.email}.`}
                          confirmText={t("cancelInvitation")}
                          confirmVariant="destructive"
                          onAction={() => handleCancelInvite(invite.id)}
                        >
                          <XIcon className="size-3.5" />
                          {t("cancel")}
                        </ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
};

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations("Settings.members.roles");
  const normalized = role.toLowerCase();

  if (normalized === "owner") {
    return (
      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 shadow-none font-bold text-[10px] uppercase tracking-wide h-5.5 hover:bg-indigo-50 leading-none px-2 rounded-md">
        👑 {t("owner")}
      </Badge>
    );
  }

  if (normalized === "admin") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none font-bold text-[10px] uppercase tracking-wide h-5.5 hover:bg-amber-50 leading-none px-2 rounded-md">
        🛡️ {t("admin")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-muted text-muted-foreground border-border shadow-none font-bold text-[10px] uppercase tracking-wide h-5.5 leading-none px-2 rounded-md"
    >
      👤 {t("member")}
    </Badge>
  );
}
