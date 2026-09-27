import mongoose from "mongoose";
import { IPost } from "../../common/interfaces/post.interface";
import {
  PostDeleted,
  PostStatus,
  PostVisibility,
} from "../../common/enums/post.enum";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
    },
    attachments: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.PUBLISHED,
    },
    visibility: {
      type: String,
      enum: Object.values(PostVisibility),
      default: PostVisibility.PUBLIC,
    },
    deleted: {
      type: String,
      enum: Object.values(PostDeleted),
      default: PostDeleted.NO,
    },
  },
  {
    timestamps: true,
  },
);

const PostModel = mongoose.model<IPost>("Posts", postSchema);
export default PostModel;
