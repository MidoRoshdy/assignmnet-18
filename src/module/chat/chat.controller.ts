import { Router, Request, Response } from "express";
import chatService from "./chat.service";
import { successResponce } from "../../common/exeptions/success.responce";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import {
  createGroupSchema,
  getChatSchema,
  getGroupChatSchema,
} from "./chat.validation";

const chatRouter: Router = Router();

//create a group chat
chatRouter.post(
  "/group",
  auth,
  validation(createGroupSchema),
  async (req: Request, res: Response) => {
    let group = await chatService.createGroup(req.user?.id as string, req.body);
    successResponce({
      res,
      message: "Group created successfully",
      data: group,
      status: 201,
    });
  },
);

//get group chat
chatRouter.get(
  "/group/:groupId",
  auth,
  validation(getGroupChatSchema),
  async (req: Request, res: Response) => {
    let chat = await chatService.getGroupChat(
      req.user?.id as string,
      req.params.groupId as string,
    );
    successResponce({
      res,
      message: "Group chat fetched successfully",
      data: chat,
    });
  },
);

//get one to one chat
chatRouter.get(
  "/:userId",
  auth,
  validation(getChatSchema),
  async (req: Request, res: Response) => {
    let chat = await chatService.getChat(
      req.user?.id as string,
      req.params.userId as string,
    );
    successResponce({
      res,
      message: "Chat fetched successfully",
      data: chat,
    });
  },
);

export default chatRouter;
