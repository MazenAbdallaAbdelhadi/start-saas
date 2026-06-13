"use client";

import { useRouter } from "@/i18n/navigation";

import { authClient } from "@/lib/auth/browser";

interface LogoutButtonProps {
  children: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();
  async function handleLogout() {
    await authClient.signOut(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  }

  return <span onClick={handleLogout}>{children}</span>;
};
