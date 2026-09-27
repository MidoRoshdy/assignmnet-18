import { z } from "zod";
import { UserGender } from "../../common";
import { generalFields } from "../../middleware/validation.middleware";

export const getUserProfileSchema = z.object({
  params: z.object({
    userId: generalFields.id,
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .trim()
        .regex(/^\S+\s+\S+/, "username must contain first and last name")
        .optional(),
      phone: z.string().optional(),
      gender: z.enum(UserGender).optional(),
      profilePicture: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "at least one field is required",
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(6),
      newPassword: z.string().min(6),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "new password must be different from old password",
    }),
});

export const sendFriendRequestSchema = z.object({
  params: z.object({
    friendIdentifier: z.string().trim().min(1),
  }),
});

export const friendIdSchema = z.object({
  params: z.object({
    friendId: generalFields.id,
  }),
});
