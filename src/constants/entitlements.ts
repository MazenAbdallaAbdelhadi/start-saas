import { Organization } from "@/generated/prisma/client";

export type PlanTier = "CORE" | "PLUS" | "PRO" | "SUSPENDED";
export type Role = "owner" | "admin" | "member";

// Structure of all configurable limits
export interface PlanEntitlements {
  // 1. Organization-Wide Limits (Apply to the total workspace usage)
  // -1 represents unlimited
  maxMembers: number;
}

export const ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  CORE: {
    maxMembers: 3,
  },
  PLUS: {
    maxMembers: 10,
  },
  PRO: {
    maxMembers: 50,
  },
  SUSPENDED: {
    maxMembers: 0,
  },
};

/**
 * Normalizes plan to avoid casing / null issues.
 */
export function normalizePlan(plan?: string | null): PlanTier {
  const norm = (plan || "CORE").toUpperCase();
  if (
    norm === "CORE" ||
    norm === "PLUS" ||
    norm === "PRO" ||
    norm === "SUSPENDED"
  ) {
    return norm as PlanTier;
  }
  return "CORE";
}

/**
 * Evaluates an organization-wide numerical feature limit.
 * Automatically handles the `-1` (unlimited) bypass.
 */
export async function isWithinLimit(
  organization: Organization,
  currentUsage: number,
  featureKey: keyof (typeof ENTITLEMENTS)["CORE"],
): Promise<boolean> {
  const entitlements = {
    ...ENTITLEMENTS[(organization.plan as PlanTier) || "CORE"],
    ...(organization.entitlements as object),
  };
  const maxLimit = entitlements[featureKey] as number;

  if (maxLimit === -1) return true; // Unlimited
  if (maxLimit === 0) return false; // Feature disabled

  return currentUsage < maxLimit;
}
