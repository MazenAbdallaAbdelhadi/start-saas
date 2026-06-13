import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { authClient } from "@/lib/auth/browser";

import { ICreateOrganizationSchema, IInviteMemberSchema } from "../schemas";

type AppRouterInstance = ReturnType<typeof useRouter>;

/**
 * Organization API Client
 * Wraps Better Auth organization client with unified error handling and notifications.
 */
export const organizationApi = {
  create: async (
    data: ICreateOrganizationSchema,
    router: AppRouterInstance,
    options?: { redirect?: boolean },
  ) => {
    const { data: org, error } = await authClient.organization.create({
      name: data.name,
      slug: data.slug,
      logo: data.logo,
    });

    if (error) {
      if (error.status === 403 || error.code === "FORBIDDEN") {
        toast.error(
          "Workspace limit reached. Upgrade your plan to create more workspaces.",
        );
      } else {
        toast.error(error.message || "Failed to create organization");
      }
      return null;
    }

    if (org) {
      // Set as active organization
      await authClient.organization.setActive({ organizationId: org.id });
      toast.success(`Organization "${org.name}" created successfully!`);

      if (options?.redirect !== false) {
        router.push("/dashboard");
        router.refresh();
      }
      return org;
    }
  },

  setActive: async (organizationId: string, router: AppRouterInstance) => {
    const { data, error } = await authClient.organization.setActive({
      organizationId,
    });

    if (error) {
      toast.error(error.message || "Failed to switch organization");
      return null;
    }

    toast.success("Organization switched");
    router.refresh();
    return data;
  },

  invite: async (data: IInviteMemberSchema & { organizationId: string }) => {
    const { data: invitation, error } =
      await authClient.organization.inviteMember({
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
      });

    if (error) {
      toast.error(error.message || "Failed to send invitation");
      return null;
    }

    toast.success(`Invitation sent to ${data.email}`);
    return invitation;
  },

  accept: async (invitationId: string, router: AppRouterInstance) => {
    const { data: invitation, error } =
      await authClient.organization.acceptInvitation({
        invitationId,
      });

    if (error) {
      toast.error(error.message || "Failed to accept invitation");
      return null;
    }

    // Set the joined organization as active to update the session
    if (invitation && invitation.invitation.organizationId) {
      await authClient.organization.setActive({
        organizationId: invitation.invitation.organizationId,
      });
    }

    toast.success("Invitation accepted!");
    router.push("/dashboard");
    router.refresh();
    return invitation;
  },

  cancelInvitation: async (invitationId: string) => {
    const { data, error } = await authClient.organization.cancelInvitation({
      invitationId,
    });

    if (error) {
      toast.error(error.message || "Failed to cancel invitation");
      return null;
    }

    toast.success("Invitation cancelled");
    return data;
  },

  update: async (data: {
    name?: string;
    logo?: string;
    organizationId: string;
  }) => {
    const { data: org, error } = await authClient.organization.update({
      data: {
        name: data.name,
        logo: data.logo,
      },
      organizationId: data.organizationId,
    });

    if (error) {
      toast.error(error.message || "Failed to update organization");
      return null;
    }

    toast.success("Organization updated successfully");
    return org;
  },

  delete: async (organizationId: string, router: AppRouterInstance) => {
    const { data, error } = await authClient.organization.delete({
      organizationId,
    });

    if (error) {
      toast.error(error.message || "Failed to delete organization");
      return null;
    }

    toast.success("Organization deleted");
    router.push("/onboarding");
    router.refresh();
    return data;
  },

  removeMember: async (memberId: string) => {
    const { data, error } = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
    });

    if (error) {
      toast.error(error.message || "Failed to remove member");
      return null;
    }

    toast.success("Member removed from organization");
    return data;
  },

  updateMemberRole: async (
    memberId: string,
    role: "owner" | "admin" | "member",
  ) => {
    const { data, error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });

    if (error) {
      toast.error(error.message || "Failed to update member role");
      return null;
    }

    toast.success("Member role updated successfully");
    return data;
  },
};
