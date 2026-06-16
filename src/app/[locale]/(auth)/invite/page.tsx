import { InviteMemberView } from "@/features/auth/components/views/invite-member-view";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;

  return <InviteMemberView token={token} />;
}
