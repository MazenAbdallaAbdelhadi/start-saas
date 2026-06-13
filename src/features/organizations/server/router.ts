import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/prisma";

export const organizationsRouter = createTRPCRouter({
  /**
   * Checks if a workspace slug is available.
   */
  checkSlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Small delay to simulate network latency if needed, 
      // but tRPC/Prisma are usually fast.
      const org = await prisma.organization.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });
      return { available: !org };
    }),
});
