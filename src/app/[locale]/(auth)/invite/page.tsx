import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getInvitationDetails } from "@/features/organizations/server/service";
import { InvitationAcceptance } from "@/features/organizations/components/invite/invitation-acceptance";
import { CardWrapper } from "@/features/auth/components/card-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const t = await getTranslations("Auth.invite");
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="h-svh flex flex-col items-center justify-center p-4">
        <CardWrapper
          headerLabel={t("invalidTitle")}
          headerCaption={t("invalidCaption")}
          backButtonLabel={t("invalidBackButton")}
          backButtonHref="/login"
        >
          <p className="text-center text-muted-foreground text-sm py-4">
            {t("invalidBody")}
          </p>
        </CardWrapper>
      </div>
    );
  }

  const details = await getInvitationDetails(token);

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      
      <Suspense fallback={<InviteSkeleton />}>
        <InvitationAcceptance token={token} details={details} />
      </Suspense>
    </div>
  );
}

function InviteSkeleton() {
  return (
    <div className="w-[448px] h-[340px] bg-card rounded-xl border-2 flex flex-col p-8 items-center gap-6 animate-pulse">
      <Skeleton className="size-16 rounded-full" />
      <div className="space-y-3 w-full flex flex-col items-center">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-4 w-full pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-1/3 mx-auto" />
      </div>
    </div>
  );
}
