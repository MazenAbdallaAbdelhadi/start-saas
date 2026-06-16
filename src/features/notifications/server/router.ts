import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/prisma";
import { NOTIFICATION_TYPES } from "@/constants/notifications";
import { PAGINATION } from "@/constants/pagination";
import { dispatchNotification } from "@/lib/notifications";

export const notificationsRouter = createTRPCRouter({
  // -- QUERIES --

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.notification.count({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
    });
  }),

  getPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        limit: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = {
        userId: ctx.user.id,
        isRead: input.unreadOnly ? false : undefined,
      };

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      const totalCount = await prisma.notification.count({
        where: whereClause,
      });

      return {
        items: notifications,
        totalCount,
        totalPages: Math.ceil(totalCount / input.limit),
      };
    }),

  getInfinite: protectedProcedure
    .input(
      z.object({
        limit: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        cursor: z.string().nullish(), // string ID of the last item
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, unreadOnly } = input;
      const whereClause = {
        userId: ctx.user.id,
        isRead: unreadOnly ? false : undefined,
      };

      const items = await prisma.notification.findMany({
        take: limit + 1, // get an extra item at the end to act as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | null = null;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      const totalCount = await prisma.notification.count({
        where: whereClause,
      });

      return {
        items,
        nextCursor,
        totalCount,
      };
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await prisma.notificationSetting.findMany({
      where: {
        userId: ctx.user.id,
      },
    });

    const filledSettings = NOTIFICATION_TYPES.map((typeConfig) => {
      const existing = settings.find((s) => s.type === typeConfig.id);
      return (
        existing || {
          id: `temp-${typeConfig.id}`,
          userId: ctx.user.id,
          type: typeConfig.id,
          inApp: true,
          push: true,
          email: false,
        }
      );
    });

    return filledSettings.map((s) => ({
      ...s,
      meta: NOTIFICATION_TYPES.find((t) => t.id === s.type),
    }));
  }),

  // -- MUTATIONS --

  updateSetting: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        inApp: z.boolean().optional(),
        push: z.boolean().optional(),
        email: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.notificationSetting.upsert({
        where: {
          userId_type: {
            userId: ctx.user.id,
            type: input.type,
          },
        },
        create: {
          userId: ctx.user.id,
          type: input.type,
          inApp: input.inApp ?? true,
          push: input.push ?? true,
          email: input.email ?? false,
        },
        update: {
          ...(input.inApp !== undefined && { inApp: input.inApp }),
          ...(input.push !== undefined && { push: input.push }),
          ...(input.email !== undefined && { email: input.email }),
        },
      });
      return { success: true };
    }),

  registerToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        device: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.fcmToken.upsert({
        where: { token: input.token },
        create: {
          userId: ctx.user.id,
          token: input.token,
          device: input.device,
          lastUsed: new Date(),
        },
        update: {
          lastUsed: new Date(),
          userId: ctx.user.id,
        },
      });
      return { success: true };
    }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.notification.updateMany({
        where: {
          id: { in: input.notificationIds },
          userId: ctx.user.id,
        },
        data: { isRead: true },
      });
      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.notification.updateMany({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { success: true };
  }),

  dispatch: protectedProcedure
    .input(
      z.object({
        targetUserIds: z.array(z.string()).min(1),
        notification: z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          type: z.string(),
          link: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return dispatchNotification({
        targetUserIds: input.targetUserIds,
        payload: input.notification,
      });
    }),
});
