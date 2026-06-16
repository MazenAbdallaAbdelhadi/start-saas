import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

import { notificationsRouter } from "@/features/notifications/server/router";

export const appRouter = createTRPCRouter({
  notifications: notificationsRouter,

  /**
   * Health-check / demo procedure — intentionally unauthenticated.
   *
   * ⚠️ WARNING: This uses `baseProcedure` (no auth).
   * For real endpoints, use `protectedProcedure` instead.
   */
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
