import { Types } from "mongoose";
import { PostDeleted, PostStatus, PostVisibility } from "../enums/post.enum";

export interface IPost {
  content: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  likes?: Types.ObjectId[];
  status?: PostStatus;
  visibility?: PostVisibility;
  deleted?: PostDeleted;
  createdAt?: Date;
  updatedAt?: Date;
}
