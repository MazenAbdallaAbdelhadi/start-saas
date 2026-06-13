import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z][a-z0-9-]*$/, "Slug must start with a letter and contain only alphanumeric characters and hyphens"),
  logo: z.string().optional(), // We'll defer logo upload logic for now
});

export type ICreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
});

export type IInviteMemberSchema = z.infer<typeof inviteMemberSchema>;
