import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { NOTIFICATION_TYPES } from "@/constants/notifications";

export type NotificationType = any;

export type GroupedByDate = {
  label: string;
  items: NotificationType[];
};

export type GroupedByCategory = {
  label: string;
  items: NotificationType[];
};

export function groupNotificationsByDate(notifications: NotificationType[]): GroupedByDate[] {
  const groups: Record<string, NotificationType[]> = {
    "today": [],
    "yesterday": [],
    "last7Days": [],
    "last30Days": [],
    "older": [],
  };

  for (const n of notifications) {
    const date = typeof n.createdAt === 'string' ? parseISO(n.createdAt) : new Date(n.createdAt);
    if (isToday(date)) {
      groups["today"].push(n);
    } else if (isYesterday(date)) {
      groups["yesterday"].push(n);
    } else if (isThisWeek(date)) {
      groups["last7Days"].push(n);
    } else if (isThisMonth(date)) {
      groups["last30Days"].push(n);
    } else {
      groups["older"].push(n);
    }
  }

  // Filter out empty groups and return as array
  return [
    { label: "today", items: groups["today"] },
    { label: "yesterday", items: groups["yesterday"] },
    { label: "last7Days", items: groups["last7Days"] },
    { label: "last30Days", items: groups["last30Days"] },
    { label: "older", items: groups["older"] },
  ].filter(g => g.items.length > 0);
}

export function groupNotificationsByCategory(notifications: NotificationType[]): GroupedByCategory[] {
  const groups = new Map<string, NotificationType[]>();

  for (const n of notifications) {
    const meta = NOTIFICATION_TYPES.find((t) => t.id === n.type);
    const label = meta ? meta.id : n.type || "otherUpdates";
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(n);
  }

  const result: GroupedByCategory[] = [];
  groups.forEach((items, label) => {
    result.push({ label, items });
  });

  // Sort groups alphabetically or by size
  return result.sort((a, b) => b.items.length - a.items.length);
}
