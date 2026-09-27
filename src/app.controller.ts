import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { globalErrorHandler } from "./middleware/errorHandler";
import { connectDB } from "./database/connection";
import { realTimeGetway } from "./module/realtime/realTime.getway";
import { env } from "./config/env.service";
import { NotFoundError } from "./common/exeptions/error.responce";
import authRouter from "./module/auth/auth.controller";
import userRouter from "./module/user/user.controller";
import postRouter from "./module/post/post.controller";
import commentRouter from "./module/comment/comment.controller";
import chatRouter from "./module/chat/chat.controller";

export const bootstrap = async () => {
  console.log("from app.controller");

  //connect to mongodb
  await connectDB();

  //create express app
  const app = express();

  //parse json body
  app.use(express.json());

  //cors
  app.use(
    cors({
      origin: ["http://localhost:3000", env.clientUrl as string],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  //rate limit
  const limitter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests, please try again later.",
  });
  app.use(limitter);

  //helmet
  app.use(helmet());

  app.get("/health-check", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Server is running",
    });
  });

  //routes
  app.use("/auth", authRouter);
  app.use(["/user", "/users"], userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/chat", chatRouter);

  app.use((req: Request, res: Response) => {
    throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  });

  app.use(globalErrorHandler);
  const httpServer = app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  realTimeGetway.initializer(httpServer);
};
