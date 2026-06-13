import { PlanTier } from "./entitlements";

// Defined exactly as requested: in Egyptian Pounds (EGP/EG)
export const PLAN_PRICING: Record<
  PlanTier,
  { monthly: number; currency: string }
> = {
  CORE: { monthly: 149, currency: "EGP" },
  PLUS: { monthly: 349, currency: "EGP" },
  PRO: { monthly: 749, currency: "EGP" },
  SUSPENDED: { monthly: 0, currency: "EGP" },
};

// Configurable support and upgrade channels
export const UPGRADE_CONTACT_CHANNELS = [
  {
    platform: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20BE5A] text-white",
    icon: "message-circle", // Mapped dynamically in the UI to a Lucide Phone/Message icon if desired
    link: "https://wa.me/something", // Replace with real admin WA link
    description: "Get an instant response.",
  },
];
