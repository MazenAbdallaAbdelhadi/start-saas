export type Role = "user" | "admin";

export const PERMISSIONS = {} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [],
  admin: [],
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
