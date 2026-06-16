import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
});
export type IProfileSchema = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Password must not be empty" }),
    newPassword: z
      .string()
      .min(8, { error: "New Password must be at least 8 charachters" }),
    newPasswordConfirm: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    error: "Password confirm should match the new password",
  });
export type IChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const twoFactorAuthSchema = z.object({
  password: z.string().min(1),
});
export type ITwoFactorAuthSchema = z.infer<typeof twoFactorAuthSchema>;

export const qrSchema = z.object({
  token: z.string().length(6),
});
export type IQrSchema = z.infer<typeof qrSchema>;
