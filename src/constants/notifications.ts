export const NOTIFICATION_TYPES = [
  {
    id: "SYSTEM_ALERT",
    label: "System Alerts",
    description: "Important platform updates and alerts",
  },
  {
    id: "TEAM_MENTION",
    label: "Team Mentions",
    description: "When you are mentioned in an internal note",
  },
] as const;

export type NotificationTypeId = (typeof NOTIFICATION_TYPES)[number]["id"];

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationTypeId | string;
  link?: string;
}
