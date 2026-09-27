import { Router, Request, Response } from "express";
import authService from "./auth.service";
import { successResponce } from "../../common/exeptions/success.responce";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import {
  confirmEmailSchema,
  emailSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation";

const authRouter: Router = Router();

authRouter.get("/check", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

//register a new user
authRouter.post(
  "/register",
  validation(registerSchema),
  async (req: Request, res: Response) => {
    let registerUser = await authService.register(req.body);
    successResponce({
      res,
      message: "Register successful",
      data: registerUser,
      status: 200,
    });
  },
);

//login a user
authRouter.post(
  "/login",
  validation(loginSchema),
  async (req: Request, res: Response) => {
    let loginUser = await authService.login(req.body);
    successResponce({
      res,
      message: "login successfully",
      data: loginUser,
      status: 200,
    });
  },
);

//get new tokens using refresh token
authRouter.post(
  "/refresh-token",
  validation(refreshTokenSchema),
  async (req: Request, res: Response) => {
    let tokens = await authService.refreshToken(req.body);
    successResponce({
      res,
      message: "Token refreshed successfully",
      data: tokens,
    });
  },
);

//logout
authRouter.post("/logout", auth, async (req: Request, res: Response) => {
  await authService.logout(
    req.user?.id as string,
    req.token as string,
    req.user?.exp,
  );
  successResponce({
    res,
    message: "Logout successful",
  });
});

//confirm email
authRouter.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  async (req: Request, res: Response) => {
    await authService.confirmEmail(req.body);
    successResponce({
      res,
      message: "Email confirmed successfully",
    });
  },
);

//resend confirm email otp
authRouter.post(
  "/resend-confirm-email",
  validation(emailSchema),
  async (req: Request, res: Response) => {
    await authService.resendConfirmEmail(req.body);
    successResponce({
      res,
      message: "OTP sent successfully",
    });
  },
);

//forget password
authRouter.post(
  "/forget-password",
  validation(emailSchema),
  async (req: Request, res: Response) => {
    await authService.forgetPassword(req.body);
    successResponce({
      res,
      message: "OTP sent successfully",
    });
  },
);

//reset password
authRouter.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    successResponce({
      res,
      message: "Password reset successfully",
    });
  },
);

export default authRouter;
