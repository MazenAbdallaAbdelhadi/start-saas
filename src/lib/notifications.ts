import { NotificationPayload } from "@/constants/notifications";

import prisma from "@/lib/prisma";
import { messaging } from "@/lib/firebase/messaging";

type NotifyUsersParams = {
  targetUserIds: string[];
  payload: NotificationPayload;
};

/**
 * Dispatches a notification to specified users, honoring their personal notification settings.
 * It writes the DB Notification records for the in-app Bell/Inbox,
 * and securely fires Web Push FCM requests if enabled.
 */
export async function dispatchNotification({
  targetUserIds,
  payload,
}: NotifyUsersParams) {
  if (targetUserIds.length === 0) return { success: true, targets: 0 };

  // 1. Resolve user preferences
  const settings = await prisma.notificationSetting.findMany({
    where: {
      userId: { in: targetUserIds },
      type: payload.type,
    },
  });

  const pushUserIds: string[] = [];
  const inAppUserIds: string[] = [];

  targetUserIds.forEach((id) => {
    const userSetting = settings.find((s) => s.userId === id);
    // Apply Schema defaults (true) if setting record doesn't exist yet
    if (!userSetting || userSetting.inApp) inAppUserIds.push(id);
    if (!userSetting || userSetting.push) pushUserIds.push(id);
  });

  // 2. Write the Notification to the DB for in-app viewing (Bell)
  if (inAppUserIds.length > 0) {
    const dbNotifications = inAppUserIds.map((userId) => ({
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      link: payload.link,
    }));

    await prisma.notification.createMany({
      data: dbNotifications,
    });
  }

  // 3. Transmit to Firebase Cloud Messaging for Push
  if (pushUserIds.length > 0) {
    const tokens = await prisma.fcmToken.findMany({
      where: { userId: { in: pushUserIds } },
    });

    const validTokens = tokens.map((t) => t.token);

    if (validTokens.length > 0) {
      try {
        // Strip out semantic HTML tags so the push payload renders as clean plain text on OS level
        const plainTextBody = payload.body.replace(/<[^>]*>?/gm, "");

        const messageBase = {
          notification: {
            title: payload.title,
            body: plainTextBody,
          },
          data: {
            link: payload.link || "/notifications",
            type: payload.type,
            htmlBody: payload.body,
          },
        };

        const failedTokens: string[] = [];
        const chunkSize = 500;
        const chunks: string[][] = [];

        for (let i = 0; i < validTokens.length; i += chunkSize) {
          chunks.push(validTokens.slice(i, i + chunkSize));
        }

        await Promise.all(
          chunks.map(async (tokenBatch) => {
            const message = { ...messageBase, tokens: tokenBatch };
            const response = await messaging.sendEachForMulticast(message);

            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                if (
                  resp.error?.code === "messaging/invalid-registration-token" ||
                  resp.error?.code ===
                    "messaging/registration-token-not-registered"
                ) {
                  failedTokens.push(tokenBatch[idx]);
                }
              }
            });
          }),
        );

        if (failedTokens.length > 0) {
          await prisma.fcmToken.deleteMany({
            where: { token: { in: failedTokens } },
          });
        }
      } catch (e) {
        console.error("FCM broadcast error:", e);
      }
    }
  }

  return { success: true, targets: targetUserIds.length };
}
