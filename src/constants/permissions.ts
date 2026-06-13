export type Role = "owner" | "admin" | "member";

export const PERMISSIONS = {
  MANAGE_ORG_SETTINGS: "manage_org_settings", // Edit org name, delete/archive
  VIEW_ORG_SETTINGS: "view_org_settings", // View the settings page
  MANAGE_MEMBERS: "manage_members", // Invite, remove, cancel invites
  MANAGE_BILLING: "manage_billing", // Upgrade, change plans
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    PERMISSIONS.MANAGE_ORG_SETTINGS,
    PERMISSIONS.VIEW_ORG_SETTINGS,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_BILLING,
  ],
  admin: [
    PERMISSIONS.VIEW_ORG_SETTINGS, // Admins can view settings in read-only mode
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_BILLING,
  ],
  member: [], // Core app usage only
};

export const hasPermission = (
  role: string | null | undefined,
  permission: Permission,
): boolean => {
  if (!role) return false;

  // Normalize role to lowercase for safety
  const normalizedRole = role.toLowerCase() as Role;
  const permissions = ROLE_PERMISSIONS[normalizedRole];

  return permissions ? permissions.includes(permission) : false;
};
