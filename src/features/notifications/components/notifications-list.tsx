"use client";

import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger } from "nuqs";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle2, Circle, BellDot, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  groupNotificationsByDate,
  groupNotificationsByCategory,
} from "@/features/notifications/lib/grouping";
import { PAGINATION } from "@/constants/pagination";

import { useTranslations, useFormatter } from "next-intl";

export function NotificationsList() {
  const t = useTranslations("Notifications.list");
  const format = useFormatter();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [activeTab, setActiveTab] = useQueryState("filter", {
    defaultValue: "all",
  });
  const [viewMode, setViewMode] = useQueryState("view", {
    defaultValue: "date",
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryOpts = trpc.notifications.getPaginated.queryOptions({
    page,
    limit: PAGINATION.MAX_PAGE_SIZE,
    unreadOnly: activeTab === "unread",
  });

  const { data: result, isLoading } = useQuery({
    ...queryOpts,
    refetchInterval: 45000, // Background polling
  });

  const notifications = result?.items || [];
  const totalPages = result?.totalPages || 1;

  const displayGroups =
    viewMode === "date"
      ? groupNotificationsByDate(notifications)
      : groupNotificationsByCategory(notifications);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;

      if (payload && payload.notification) {
        queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
          if (!old) return old;
          return {
            ...old,
            items: [
              {
                id: payload.messageId || window.crypto.randomUUID(),
                title: payload.notification.title,
                body: payload.data?.htmlBody || payload.notification.body,
                createdAt: new Date(),
                isRead: false,
                link: payload.data?.link || "/notifications",
                type: payload.notification.type || "SYSTEM_ALERT",
                userId: "optimistic",
                organizationId: null,
                metadata: null,
              },
              ...old.items,
            ],
            totalCount: old.totalCount + 1,
          };
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.getPaginated.queryKey(),
        });
      }
    };

    window.addEventListener("fcm-message", handleUpdate);
    window.addEventListener("notifications-updated", handleUpdate);
    return () => {
      window.removeEventListener("fcm-message", handleUpdate);
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, [queryClient, queryOpts.queryKey, trpc]);

  const markAsReadMutation = useMutation(
    trpc.notifications.markAsRead.mutationOptions({
      onMutate: async ({ notificationIds }) => {
        await queryClient.cancelQueries({ queryKey: queryOpts.queryKey });
        const previousData = queryClient.getQueryData(queryOpts.queryKey);

        queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((n) =>
              notificationIds.includes(n.id) ? { ...n, isRead: true } : n,
            ),
          };
        });
        window.dispatchEvent(new Event("notifications-updated"));
        return { previousData };
      },
      onError: (_err, _newTodo, context) => {
        queryClient.setQueryData(queryOpts.queryKey, context?.previousData);
        toast.error(t("errors.markReadFailed"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.getPaginated.queryKey(),
        });
      },
    }),
  );

  const markAllReadMutation = useMutation(
    trpc.notifications.markAllAsRead.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: queryOpts.queryKey });
        const previousData = queryClient.getQueryData(queryOpts.queryKey);

        queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((n) => ({ ...n, isRead: true })),
          };
        });
        window.dispatchEvent(new Event("notifications-updated"));
        return { previousData };
      },
      onSuccess: () => {
        toast.success(t("states.allCaughtUp"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.getPaginated.queryKey(),
        });
      },
    }),
  );

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ notificationIds: [id] });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/30 p-2 rounded-xl border gap-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
              <TabsTrigger value="unread">{t("tabs.unread")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="hidden sm:block border-l mx-1 border-border/50 h-8 self-center"></div>
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 sm:flex-none h-7 px-4 text-xs rounded-md ${viewMode === "date" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
              onClick={() => setViewMode("date")}
            >
              {t("views.timeline")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 sm:flex-none h-7 px-4 text-xs rounded-md ${viewMode === "category" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"}`}
              onClick={() => setViewMode("category")}
            >
              {t("views.category")}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-muted-foreground hover:text-foreground"
        >
          <CheckCircle2 className="w-4 h-4 me-2" />
          {t("actions.markAllRead")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
            {t("states.loading")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center border rounded-xl bg-card/10 border-dashed">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-semibold mb-1 tracking-tight">
              {t("states.emptyTitle")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {t("states.emptyDesc")}
            </p>
          </div>
        ) : (
          displayGroups.map((group, gIdx) => (
            <div key={group.label} className="mt-2 mb-4">
              <h4 className="text-sm font-semibold tracking-tight text-foreground/70 uppercase mb-3 px-2">
                {viewMode === "date"
                  ? t(`grouping.${group.label}`)
                  : t(`types.${group.label}.label`, { defaultValue: group.label })}
              </h4>
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "transition-all duration-200 overflow-hidden group",
                      item.isRead
                        ? "bg-muted/10 opacity-70 hover:opacity-100"
                        : "bg-card border-primary/20 shadow-sm",
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-row items-start p-5 gap-4">
                        <div className="mt-1 shrink-0">
                          {!item.isRead ? (
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                              <BellDot className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="p-2 bg-muted rounded-full text-muted-foreground">
                              <Inbox className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p
                                className={cn(
                                  "text-base font-semibold",
                                  !item.isRead && "text-primary text-lg",
                                )}
                              >
                                {item.title}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground shrink-0 ps-4">
                              <span>
                                {format.relativeTime(new Date(item.createdAt), new Date())}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "text-sm text-muted-foreground leading-relaxed max-w-2xl prose prose-sm prose-neutral dark:prose-invert",
                              !item.isRead && "text-foreground font-medium",
                            )}
                            dangerouslySetInnerHTML={{ __html: item.body }}
                          />
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!item.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                              onClick={() => handleMarkAsRead(item.id)}
                              title={t("actions.markAsRead")}
                            >
                              <Circle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Local Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border mt-4 pt-4 px-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
            >
              {t("pagination.previous")}
            </Button>
            <div className="text-sm text-muted-foreground font-medium">
              {t("pagination.pageInfo", { page, totalPages })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              {t("pagination.next")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
