"use client";

import { useEffect, useState } from "react";
import { messaging, onMessage, getToken } from "@/lib/firebase/client";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const trpc = useTRPC();
  const { mutate: registerToken } = useMutation(
    trpc.notifications.registerToken.mutationOptions(),
  );

  useEffect(() => {
    // Check if we are in a browser and service workers are supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (!messaging) return;

      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const registration = await getFirebaseSW();

            const token = await getToken(messaging!, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            });
            if (token) {
              setFcmToken(token);
              // Register token to our database so the server can push to it
              registerToken({ token, device: navigator.userAgent });
            }
          }
        } catch (error) {
          console.error("Failed to get FCM token:", error);
        }
      };

      requestPermission();

      // Listen for foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        toast.info(payload.notification?.title || "New Message", {
          description: payload.notification?.body,
        });

        // Dispatch global CustomEvent carrying payload for optimistic UI injection
        window.dispatchEvent(
          new CustomEvent("fcm-message", { detail: payload }),
        );
      });

      // Bridge: Listen for background SW messages pushed to client
      const fcmChannel = new BroadcastChannel("fcm-channel");
      fcmChannel.onmessage = (event) => {
        window.dispatchEvent(
          new CustomEvent("fcm-message", { detail: event.data }),
        );
      };

      return () => {
        unsubscribe();
        fcmChannel.close();
      };
    }
  }, [registerToken]);

  return { fcmToken };
}

async function getFirebaseSW() {
  const existing = await navigator.serviceWorker.getRegistration(
    "/firebase-messaging-sw.js",
  );

  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}
