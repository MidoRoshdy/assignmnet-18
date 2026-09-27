import { Types } from "mongoose";
import {
  CommentDeleted,
  CommentStatus,
  CommentType,
  CommentVisibility,
} from "../enums/comment.enum";

export interface IComment {
  content: string;
  postId: Types.ObjectId;
  createdBy: Types.ObjectId;
  type?: CommentType;
  status?: CommentStatus;
  visibility?: CommentVisibility;
  deleted?: CommentDeleted;
  createdAt?: Date;
  updatedAt?: Date;
}
