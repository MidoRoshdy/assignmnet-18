import { Types } from "mongoose";
import { ZodType } from "zod";
import chatService from "../chat.service";
import { redisService } from "../../../common/service/redis.service";
import { BadRequestError } from "../../../common/exeptions/error.responce";
import {
  joinRoomSchema,
  sendGroupMessageSchema,
  sendMessageSchema,
} from "../chat.validation";

export class ChatEvent {
  constructor() {}

  private validate<T>(schema: ZodType<T>, data: unknown): T {
    let result = schema.safeParse(data);
    if (!result.success) {
      throw new BadRequestError("Validation failed", result.error.message);
    }
    return result.data;
  }

  private handleError(socket: any, error: any) {
    socket.emit("custom_error", {
      message: error?.message || "Something went wrong",
      cause: error?.cause,
    });
  }

  sayhi(socket: any) {
    return socket.on("sayhi", (data: any) => {
      console.log(data);
      socket.emit("send", "typing........");
    });
  }

  //one to one message
  sendMessage(socket: any, io: any) {
    return socket.on("sendMessage", async (data: any) => {
      try {
        let { content, sendTo } = this.validate(sendMessageSchema, data);
        let userId = socket.data.id;
        await chatService.sendMessage(userId, { content, sendTo });
        socket.emit("successMessage", { content, sendTo });
        let receiverSockets = await redisService.getUserSockets(
          new Types.ObjectId(sendTo),
        );
        if (receiverSockets.length) {
          io.to(receiverSockets).emit("newMessage", { content, from: userId });
        }
      } catch (error) {
        this.handleError(socket, error);
      }
    });
  }

  //group message
  sendGroupMessage(socket: any, io: any) {
    return socket.on("sendGroupMessage", async (data: any) => {
      try {
        let { content, groupId } = this.validate(sendGroupMessageSchema, data);
        let userId = socket.data.id;
        let chat = await chatService.sendGroupMessage(userId, {
          content,
          groupId,
        });
        socket.emit("successMessage", { content, sendTo: groupId });
        socket
          .to(chat.roomId)
          .emit("newMessage", { content, from: userId, groupId });
      } catch (error) {
        this.handleError(socket, error);
      }
    });
  }

  //join group room
  joinRoom(socket: any) {
    return socket.on("join_room", async (data: any) => {
      try {
        let { roomId } = this.validate(joinRoomSchema, data);
        let canJoin = await chatService.canJoinRoom(socket.data.id, roomId);
        if (!canJoin) {
          throw new BadRequestError("you are not a member of this group");
        }
        socket.join(roomId);
      } catch (error) {
        this.handleError(socket, error);
      }
    });
  }
}

export const chatEvent = new ChatEvent();
