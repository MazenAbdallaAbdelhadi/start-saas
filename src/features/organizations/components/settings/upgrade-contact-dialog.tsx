"use client";

import { MessageCircleIcon, PhoneCallIcon, MessageSquareIcon, CameraIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";

import { UPGRADE_CONTACT_CHANNELS } from "@/constants/billing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function getIcon(iconName: string) {
  switch (iconName) {
    case "whatsapp":
      return <PhoneCallIcon className="size-6" />;
    case "facebook":
      return <MessageSquareIcon className="size-6" />;
    case "instagram":
      return <CameraIcon className="size-6" />;
    default:
      return <MessageCircleIcon className="size-6" />;
  }
}

export function UpgradeContactDialog({ 
  children, 
  planName,
  isUpgrade = true
}: { 
  children: React.ReactNode; 
  planName: string; 
  isUpgrade?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative Top Banner */}
        <div className="h-28 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b">
           <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
             <MessageCircleIcon className="size-8 text-primary" />
           </div>
        </div>
        
        <div className="p-6 pt-5">
          <DialogHeader className="space-y-3 pb-6 border-b text-center">
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {isUpgrade ? "Upgrade" : "Downgrade"} to {planName}
            </DialogTitle>
            <DialogDescription className="text-base text-balance text-muted-foreground/90">
              {isUpgrade 
                ? `Ready to supercharge your workspace? Our dedicated team is ready to configure your custom \`${planName}\` limits in minutes.`
                : `Want to adjust your plan? Our team will help you switch to the \`${planName}\` tier and ensure a smooth transition of your organization's limits.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-6">
            {UPGRADE_CONTACT_CHANNELS.map((channel) => (
              <a
                key={channel.platform}
                href={channel.link}
                target="_blank"
                rel="noreferrer noopener"
                className={`
                  group flex items-center justify-between p-4 rounded-xl border-2 border-transparent 
                  hover:border-primary/20 hover:shadow-lg transition-all duration-300
                  ${channel.color}
                `}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-4">
                   <div className="bg-white/20 p-2.5 rounded-lg flex items-center justify-center shrink-0">
                     {getIcon(channel.icon)}
                   </div>
                   <div className="flex flex-col text-left">
                     <span className="font-bold text-lg leading-none">{channel.platform}</span>
                     <span className="text-xs text-white/80 font-medium mt-1.5">{channel.description}</span>
                   </div>
                </div>
                <ArrowRightIcon className="size-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </a>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-muted-foreground h-9" onClick={() => setOpen(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
