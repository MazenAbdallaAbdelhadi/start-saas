import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

import { AppBreadcrumb } from "../app-breadcrumb";
import {
  SiteOrganizationMembers,
  SiteOrganizationMembersSkeleton,
} from "./site-organization-members";
// import { SiteHeaderNotifications } from "./site-header-notifications";

export const SiteHeader = () => {
  return (
    <header className="flex h-(--header-height) bg-background/50 backdrop-blur-sm sticky top-0 z-50 rounded-t shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) overflow-hidden">
      <div className="flex flex-1 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-me-1" />
        <Separator orientation="vertical" className="mx-2" />

        <AppBreadcrumb />

        <div className="ms-auto flex items-center ps-1 h-full gap-1">
          <Suspense fallback={<SiteOrganizationMembersSkeleton />}>
            <SiteOrganizationMembers />
          </Suspense>
          {/* <Separator orientation="vertical" className="h-6 mx-2" />
          <SiteHeaderNotifications /> */}
        </div>
      </div>
    </header>
  );
};
