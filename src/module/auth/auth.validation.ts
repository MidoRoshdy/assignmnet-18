import { z } from "zod";
import { UserGender } from "../../common";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    gender: z.enum(UserGender).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const emailSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const confirmEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{6}$/, "otp must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{6}$/, "otp must be 6 digits"),
    password: z.string().min(6),
  }),
});
