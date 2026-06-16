import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";

/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });

  return { ...session };
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Protected procedure — requires an authenticated session.
 * Reads session from the shared context (no duplicate fetch).
 */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }

  return next({ ctx: { session: ctx.session, user: ctx.user! } });
});

/**
 * Organization procedure — requires an authenticated session AND an active organization.
 */
export const organizationProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session.activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "An active organization is required to perform this action.",
      });
    }

    const member = await prisma.member.findFirst({
      where: {
        userId: ctx.user.id,
        organizationId: ctx.session.activeOrganizationId,
      },
    });

    if (!member) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId: ctx.session.activeOrganizationId,
        member,
      },
    });
  },
);
