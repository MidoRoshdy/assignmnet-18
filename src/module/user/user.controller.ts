import { Router, Request, Response } from "express";
import userService from "./user.service";
import { successResponce } from "../../common/exeptions/success.responce";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import {
  changePasswordSchema,
  friendIdSchema,
  getUserProfileSchema,
  sendFriendRequestSchema,
  updateProfileSchema,
} from "./user.validation";

const userRouter: Router = Router();

//get logged in user profile
userRouter.get("/", auth, async (req: Request, res: Response) => {
  let profile = await userService.getProfile(req.user?.id as string);
  successResponce({
    res,
    message: "Profile fetched successfully",
    data: profile,
  });
});

//update logged in user profile
userRouter.patch(
  "/",
  auth,
  validation(updateProfileSchema),
  async (req: Request, res: Response) => {
    let user = await userService.updateProfile(
      req.user?.id as string,
      req.body,
    );
    successResponce({
      res,
      message: "Profile updated successfully",
      data: user,
    });
  },
);

//change password
userRouter.patch(
  "/password",
  auth,
  validation(changePasswordSchema),
  async (req: Request, res: Response) => {
    await userService.changePassword(req.user?.id as string, req.body);
    successResponce({
      res,
      message: "Password changed successfully",
    });
  },
);

//send friend request (by user id or email)
userRouter.post(
  "/friends/request/:friendIdentifier",
  auth,
  validation(sendFriendRequestSchema),
  async (req: Request, res: Response) => {
    let request = await userService.sendFriendRequest(
      req.user?.id as string,
      req.params.friendIdentifier as string,
    );
    successResponce({
      res,
      message: "Friend request sent successfully",
      data: request,
      status: 201,
    });
  },
);

//cancel a sent friend request
userRouter.delete(
  "/friends/request/:friendId",
  auth,
  validation(friendIdSchema),
  async (req: Request, res: Response) => {
    await userService.cancelFriendRequest(
      req.user?.id as string,
      req.params.friendId as string,
    );
    successResponce({
      res,
      message: "Friend request cancelled",
    });
  },
);

//accept friend request
userRouter.patch(
  "/friends/accept/:friendId",
  auth,
  validation(friendIdSchema),
  async (req: Request, res: Response) => {
    await userService.acceptFriendRequest(
      req.user?.id as string,
      req.params.friendId as string,
    );
    successResponce({
      res,
      message: "Friend request accepted",
    });
  },
);

//reject friend request
userRouter.patch(
  "/friends/reject/:friendId",
  auth,
  validation(friendIdSchema),
  async (req: Request, res: Response) => {
    await userService.rejectFriendRequest(
      req.user?.id as string,
      req.params.friendId as string,
    );
    successResponce({
      res,
      message: "Friend request rejected",
    });
  },
);

//remove a friend
userRouter.delete(
  "/friends/:friendId",
  auth,
  validation(friendIdSchema),
  async (req: Request, res: Response) => {
    await userService.removeFriend(
      req.user?.id as string,
      req.params.friendId as string,
    );
    successResponce({
      res,
      message: "Friend removed successfully",
    });
  },
);

//get another user public profile
userRouter.get(
  "/:userId",
  auth,
  validation(getUserProfileSchema),
  async (req: Request, res: Response) => {
    let user = await userService.getUserProfile(req.params.userId as string);
    successResponce({
      res,
      message: "User fetched successfully",
      data: user,
    });
  },
);

export default userRouter;
