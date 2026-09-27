import { env } from "../config/env.service";
import { BadRequestError } from "../common/exeptions/error.responce";
import mongoose from "mongoose";

export const connectDB = async () => {
  if (!env.mongodbUri) {
    throw new BadRequestError(
      "check your environment variables connections to mongodb",
    );
  }
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");
};
