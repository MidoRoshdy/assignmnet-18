import mongoose from "mongoose";
import { IComment } from "../../common/interfaces/comment.interface";
import {
  CommentDeleted,
  CommentStatus,
  CommentType,
  CommentVisibility,
} from "../../common/enums/comment.enum";

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(CommentType),
      default: CommentType.TEXT,
    },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.APPROVED,
    },
    visibility: {
      type: String,
      enum: Object.values(CommentVisibility),
      default: CommentVisibility.PUBLIC,
    },
    deleted: {
      type: String,
      enum: Object.values(CommentDeleted),
      default: CommentDeleted.NO,
    },
  },
  {
    timestamps: true,
  },
);

const CommentModel = mongoose.model<IComment>("Comments", commentSchema);
export default CommentModel;
