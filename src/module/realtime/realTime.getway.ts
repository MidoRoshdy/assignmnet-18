import { Server } from "socket.io";
import { Types } from "mongoose";
import { TokenService } from "../../common/service/token.service";
import { badRequestError } from "../../common/exeptions/error.responce";
import { redisService } from "../../common/service/redis.service";
import { realtimeChatGetway } from "../chat/realtime/realtimeChat.getway";
import { env } from "../../config/env.service";

export class RealTimeGetway {
  private io: Server | undefined;

  constructor() {}

  authanticate = async (socket: any, next: any) => {
    const tokenService = new TokenService();
    let decoded;
    try {
      decoded = await tokenService.decodeToken(socket.handshake.auth.token);
      if (!decoded) {
        throw new badRequestError("Invalid token");
      }
      let userId = (typeof decoded === "object" && decoded.id) || undefined;
      await redisService.addSocketToUser(userId, socket.id);
      socket.data = decoded;
      console.log(`Socket id => ${socket.id} and user id => ${userId}`);
      next();
    } catch (error) {
      next(error as Error);
    }
  };

  emitToUser = async (
    userId: Types.ObjectId | string,
    event: string,
    data: any,
  ) => {
    if (!this.io) return;
    let sockets = await redisService.getUserSockets(
      new Types.ObjectId(userId.toString()),
    );
    if (sockets.length) {
      this.io.to(sockets).emit(event, data);
    }
  };

  initializer(httpServer: any) {
    // socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:3000", env.clientUrl as string],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      },
    });
    this.io = io;

    io.use(this.authanticate);

    io.on("connection", async (socket) => {
      try {
        let userId = socket.data.id;
        realtimeChatGetway.register(socket, io);

        socket.on("disconnect", async () => {
          console.log(`Socket disconnected id => ${socket.id}`);
          await redisService.removeSocket(userId, socket.id);
          let sockets = await redisService.getUserSockets(userId);
          if (!sockets.length) {
            socket.broadcast.emit("offline_user", { userId });
          }
        });
      } catch (error) {
        (socket.emit(" error", "Something went wrong"), error);
      }
    });
  }
}
export const realTimeGetway = new RealTimeGetway();
