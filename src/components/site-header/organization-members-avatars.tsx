"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MailIcon, UsersIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Member {
  id: string;
  role: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

interface OrganizationMembersAvatarsProps {
  members: Member[];
}

export const OrganizationMembersAvatars = ({
  members,
}: OrganizationMembersAvatarsProps) => {
  const t = useTranslations("SiteHeader");
  const [isOpen, setIsOpen] = useState(false);

  const visibleMembers = members.slice(0, 3);
  const remainingCount = members.length > 3 ? members.length - 3 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex -space-x-3 items-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
          title={t("viewAllTeamMembers")}
        >
          {visibleMembers.map((member) => (
            <Avatar
              key={member.id}
              className="size-8 border-2 border-background ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm"
            >
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px] uppercase">
                {member.user.name.slice(0, 2)}
              </AvatarFallback>
              {member.user.image && <AvatarImage src={member.user.image} />}
            </Avatar>
          ))}

          {remainingCount > 0 && (
            <div className="size-8 rounded-full bg-muted flex items-center justify-center border-2 border-background text-[10px] font-extrabold text-muted-foreground shadow-sm">
              +{remainingCount}
            </div>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-2 shadow-2xl">
        <DialogHeader className="p-6 bg-muted/20 border-b">
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="size-5 text-primary" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              {t("teamRoster")}
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("teamRosterCaption")}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-2 py-4">
          <div className="space-y-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 transition-all group"
              >
                <Avatar className="size-11 border-2 border-background shadow-md">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                    {member.user.name.slice(0, 2)}
                  </AvatarFallback>
                  {member.user.image && <AvatarImage src={member.user.image} />}
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {member.user.name}
                    </span>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <MailIcon className="size-3" />
                    <span className="truncate">{member.user.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/10 border-t text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
            {t("collaboratorCount", { count: members.length })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations("SiteHeader");
  const normalized = role.toLowerCase();

  if (normalized === "owner") {
    return (
      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 shadow-none font-bold text-[9px] uppercase tracking-wide h-4.5 px-1.5 leading-none">
        {t("owner")}
      </Badge>
    );
  }

  if (normalized === "admin") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none font-bold text-[9px] uppercase tracking-wide h-4.5 px-1.5 leading-none">
        {t("admin")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-muted text-muted-foreground border-border shadow-none font-bold text-[9px] uppercase tracking-wide h-4.5 px-1.5 leading-none"
    >
      {t("member")}
    </Badge>
  );
}
