import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { APIError } from "better-auth/api";

import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";
import {
  Invitation,
  Member,
  organization,
} from "better-auth/plugins/organization";

import prisma from "@/lib/prisma";

import { sendDeleteAccountVerificationEmail } from "@/lib/mail/delete-account-verification-email";
import { sendOrganizationInviteEmail } from "@/lib/mail/organization-invite-email";
import { sendEmailVerificationEmail } from "@/lib/mail/verification-email";
import { sendPasswordResetEmail } from "@/lib/mail/password-reset-email";

import { canAddMember } from "@/features/organizations/server/service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  plugins: [
    twoFactor(),
    admin({ defaultRole: "user" }),
    organization({
      sendInvitationEmail: async ({
        email,
        organization,
        inviter,
        invitation,
      }) => {
        await sendOrganizationInviteEmail({
          invitation,
          inviter: inviter.user,
          organization,
          email,
        });
      },

      allowUserToCreateOrganization: async () => {
        // Temporarily allow creation to unblock user and see logs
        return true;
      },

      schema: {
        organization: {
          additionalFields: {
            plan: {
              type: "string",
              default: "CORE",
              required: false,
            },
            entitlements: {
              type: "json",
              required: false,
            },
          },
        },
      },

      organizationHooks: {
        async afterCreateOrganization({ organization: org }) {
          /**
           * TODO:
           *
           * Start users on a trial of the highest tier features for a limited time to let them experience the full product.
           *
           * We can check if they actually use those features during the trial and use that data to convert them to paid plans.
           *
           * For now, we'll just set them to the CORE plan.
           */
          // await startTrial(org.id, "CORE");
        },
      },
    }),
    nextCookies(),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (userSession) => {
          const membership = await prisma.member.findFirst({
            where: {
              userId: userSession.userId,
            },
            orderBy: {
              createdAt: "desc",
            },
            select: { organizationId: true },
          });

          return {
            data: {
              ...userSession,
              activeOrganizationId: membership?.organizationId,
            },
          };
        },
      },
    },
    member: {
      create: {
        before: async (member: Member) => {
          const allowed = await canAddMember(member.organizationId);
          if (!allowed) {
            throw new APIError("BAD_REQUEST", {
              message: "Organization member limit reached.",
            });
          }
          return { data: member };
        },
      },
    },
    invitation: {
      create: {
        before: async (invitation: Invitation) => {
          const allowed = await canAddMember(invitation.organizationId);
          if (!allowed) {
            throw new APIError("BAD_REQUEST", {
              message: "Organization member limit reached.",
            });
          }
          return { data: invitation };
        },
      },
    },
  },
});
