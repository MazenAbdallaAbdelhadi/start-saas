import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { OnboardingWizard } from "@/features/organizations/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const ownedOrg = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        role: "owner",
      },
    });

    if (ownedOrg) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="w-full flex justify-center items-center h-full">
      <OnboardingWizard />
    </div>
  );
}
