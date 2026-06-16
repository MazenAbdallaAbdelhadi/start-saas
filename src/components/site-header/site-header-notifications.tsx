// "use client";

// import { Bell, CheckCircle2, Circle, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { useTranslations } from "next-intl";
// import { useTRPC } from "@/trpc/client";
// import {
//   useInfiniteQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { formatDistanceToNow } from "date-fns";
// import { Link } from "@/i18n/navigation";
// import { Badge } from "@/components/ui/badge";
// import { useFCM } from "@/hooks/use-fcm";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import {
//   groupNotificationsByDate,
//   groupNotificationsByCategory,
// } from "@/features/notifications/lib/grouping";
// import { PAGINATION } from "@/constants/pagination";
// import { cn } from "@/lib/utils";

// export function SiteHeaderNotifications() {
//   const t = useTranslations("SiteHeader");
//   // initialize FCM listeners & tokens
//   useFCM();

//   const trpc = useTRPC();
//   const queryClient = useQueryClient();
//   const [viewMode, setViewMode] = useState<"date" | "category">("date");
//   const observer = useRef<IntersectionObserver | null>(null);

//   const queryOpts = trpc.notifications.getInfinite.infiniteQueryOptions(
//     { limit: PAGINATION.DEFAULT_PAGE_SIZE, unreadOnly: true },
//     {
//       getNextPageParam: (lastPage) => lastPage.nextCursor,
//       initialCursor: null,
//       refetchInterval: 45000,
//     },
//   );

//   const {
//     data: result,
//     isLoading,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInfiniteQuery(queryOpts);

//   const lastElementRef = useCallback(
//     (node: HTMLDivElement | null) => {
//       if (isLoading || isFetchingNextPage) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasNextPage) {
//           fetchNextPage();
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
//   );

//   const unreadCount = result?.pages?.[0]?.totalCount || 0;
//   const allItems = result?.pages?.flatMap((p) => p.items) || [];

//   const displayGroups =
//     viewMode === "date"
//       ? groupNotificationsByDate(allItems)
//       : groupNotificationsByCategory(allItems);

//   // Mutations for rapid optimistic UI
//   const markAsReadMutation = useMutation(
//     trpc.notifications.markAsRead.mutationOptions({
//       onMutate: async ({ notificationIds }) => {
//         await queryClient.cancelQueries({ queryKey: queryOpts.queryKey });
//         const previousData = queryClient.getQueryData(queryOpts.queryKey);

//         queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
//           if (!old) return old;
//           return {
//             ...old,
//             pages: old.pages.map((page) => ({
//               ...page,
//               items: page.items.filter((n) => !notificationIds.includes(n.id)),
//               totalCount: Math.max(0, page.totalCount - notificationIds.length),
//             })),
//           };
//         });
//         window.dispatchEvent(new Event("notifications-updated"));
//         return { previousData };
//       },
//       onSettled: () =>
//         queryClient.invalidateQueries({
//           queryKey: trpc.notifications.getInfinite.queryKey(),
//         }),
//     }),
//   );

//   const markAllReadMutation = useMutation(
//     trpc.notifications.markAllAsRead.mutationOptions({
//       onMutate: async () => {
//         await queryClient.cancelQueries({ queryKey: queryOpts.queryKey });
//         const previousData = queryClient.getQueryData(queryOpts.queryKey);

//         queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
//           if (!old) return old;
//           return {
//             ...old,
//             pages: old.pages.map((p) => ({ ...p, items: [], totalCount: 0 })),
//           };
//         });
//         window.dispatchEvent(new Event("notifications-updated"));
//         return { previousData };
//       },
//       onSettled: () =>
//         queryClient.invalidateQueries({
//           queryKey: trpc.notifications.getInfinite.queryKey(),
//         }),
//     }),
//   );

//   const isPending =
//     markAsReadMutation.isPending || markAllReadMutation.isPending;

//   const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
//     e.preventDefault();
//     e.stopPropagation();
//     markAsReadMutation.mutate({ notificationIds: [id] });
//   };

//   const handleMarkAllRead = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     markAllReadMutation.mutate(undefined);
//   };

//   useEffect(() => {
//     const handleUpdate = (e: Event) => {
//       const customEvent = e as CustomEvent;
//       const payload = customEvent.detail;

//       // Optimistically inject the new Web Push into the TRPC cache directly
//       if (payload && payload.notification) {
//         queryClient.setQueryData(queryOpts.queryKey, (old: typeof result) => {
//           if (!old) return old;
//           return {
//             ...old,
//             pages: old.pages.map((p, idx) => {
//               if (idx === 0) {
//                 return {
//                   ...p,
//                   items: [
//                     {
//                       id: payload.messageId || window.crypto.randomUUID(),
//                       title: payload.notification.title,
//                       body: payload.data?.htmlBody || payload.notification.body,
//                       createdAt: new Date(),
//                       isRead: false,
//                       link: payload.data?.link || "/notifications",
//                       type: payload.notification.type || "SYSTEM_ALERT",
//                       userId: "optimistic",
//                       organizationId: null,
//                       metadata: null,
//                     },
//                     ...p.items,
//                   ],
//                   totalCount: p.totalCount + 1,
//                 };
//               }
//               return p;
//             }),
//           };
//         });
//       } else {
//         queryClient.invalidateQueries({
//           queryKey: trpc.notifications.getInfinite.queryKey(),
//         });
//       }
//     };

//     window.addEventListener("fcm-message", handleUpdate);
//     window.addEventListener("notifications-updated", handleUpdate);
//     return () => {
//       window.removeEventListener("fcm-message", handleUpdate);
//       window.removeEventListener("notifications-updated", handleUpdate);
//     };
//   }, [queryClient, queryOpts.queryKey, trpc]);

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="relative me-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-full h-8 w-8"
//         >
//           <Bell className="w-[18px] h-[18px]" strokeWidth={2.5} />
//           {unreadCount > 0 && (
//             <Badge
//               variant="destructive"
//               className="absolute -top-1 -right-1 px-1 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-in zoom-in border border-background shadow-sm"
//             >
//               {unreadCount > 99 ? "99+" : unreadCount}
//             </Badge>
//           )}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         align="end"
//         className="w-[340px] p-0 shadow-lg rounded-xl overflow-hidden border-border/50"
//       >
//         <div className="flex flex-col px-4 py-3 bg-muted/20 backdrop-blur-md">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <h4 className="font-semibold text-sm tracking-tight text-foreground/90">
//                 {t("notifications")}
//               </h4>
//               {unreadCount > 0 && (
//                 <span className="text-[10px] font-medium text-primary px-1.5 py-0.5 bg-primary/10 rounded-md">
//                   {t("new", { count: unreadCount })}
//                 </span>
//               )}
//             </div>
//             {unreadCount > 0 && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleMarkAllRead}
//                 disabled={isPending}
//                 className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
//               >
//                 <CheckCircle2 className="w-3 h-3 me-1" />
//                 {t("markAllRead")}
//               </Button>
//             )}
//           </div>
//           <div className="flex bg-muted/50 p-0.5 rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               className={`flex-1 h-7 text-xs rounded-md ${viewMode === "date" ? "bg-background shadow-sm" : "hover:bg-muted/50"}`}
//               onClick={() => setViewMode("date")}
//             >
//               {t("dateTab")}
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className={`flex-1 h-7 text-xs rounded-md ${viewMode === "category" ? "bg-background shadow-sm" : "hover:bg-muted/50"}`}
//               onClick={() => setViewMode("category")}
//             >
//               {t("categoryTab")}
//             </Button>
//           </div>
//         </div>
//         <Separator className="opacity-50" />
//         <div className="overflow-y-auto max-h-[380px] sm:max-h-[60vh] flex-1 min-h-0 relative">
//           {allItems.length === 0 && !isLoading ? (
//             <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
//               <div className="p-3 bg-muted/50 rounded-full mb-3">
//                 <Bell className="w-5 h-5 opacity-40" />
//               </div>
//               <span className="text-foreground/70 font-medium">
//                 {t("emptyTitle")}
//               </span>
//               <span className="text-xs mx-4 mt-1">
//                 {t("emptyBody")}
//               </span>
//             </div>
//           ) : (
//             <div className="flex flex-col pb-2">
//               {displayGroups.map((group, groupIdx) => (
//                 <div key={group.label} className="flex flex-col">
//                   <div className="sticky top-0 z-20 px-4 py-1.5 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-y border-border/50 shadow-sm">
//                     <span className="text-xs font-semibold text-muted-foreground">
//                       {group.label}
//                     </span>
//                   </div>
//                   <div className="flex flex-col relative z-0">
//                     {group.items.map((n, i) => (
//                       <Link href={n.link || "/notifications"} key={n.id}>
//                         <div className="relative group p-4 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-b-0">
//                           <div className="flex-1 space-y-1">
//                             <div className="flex items-start justify-between">
//                               <p
//                                 className={cn(
//                                   "text-sm font-medium leading-none",
//                                   !n.isRead && "text-primary",
//                                 )}
//                               >
//                                 {n.title}
//                               </p>
//                               <p className="text-xs text-muted-foreground ms-2 shrink-0">
//                                 {formatDistanceToNow(new Date(n.createdAt), {
//                                   addSuffix: true,
//                                 })}
//                               </p>
//                             </div>
//                             <div
//                               className={cn(
//                                 "text-xs leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none line-clamp-3",
//                                 !n.isRead
//                                   ? "text-foreground"
//                                   : "text-muted-foreground",
//                               )}
//                               dangerouslySetInnerHTML={{ __html: n.body }}
//                             />
//                           </div>
//                           {!n.isRead && (
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={(e) => handleMarkAsRead(e, n.id)}
//                               disabled={isPending}
//                               className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary hover:bg-primary/10 rounded-full z-10"
//                             >
//                               <Circle className="w-3.5 h-3.5" />
//                             </Button>
//                           )}
//                         </div>
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               ))}

//               {/* Infinite Scroll trigger area */}
//               {(hasNextPage || isFetchingNextPage) && (
//                 <div
//                   ref={lastElementRef}
//                   className="p-4 flex justify-center text-muted-foreground mt-2"
//                 >
//                   <Loader2 className="h-4 w-4 animate-spin opacity-50" />
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//         <Separator className="opacity-50" />
//         <div className="p-1.5 bg-muted/10">
//           <Link href="/notifications">
//             <Button
//               variant="ghost"
//               className="w-full text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-lg h-8"
//               size="sm"
//             >
//               {t("viewAll")}
//             </Button>
//           </Link>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }
