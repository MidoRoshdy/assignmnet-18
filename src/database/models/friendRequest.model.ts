import mongoose from "mongoose";
import { IFriendRequest } from "../../common/interfaces/friendRequest.interface";
import {
  FriendRequestDeleted,
  FriendRequestStatus,
} from "../../common/enums/friend.interface";

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
    },
    deleted: {
      type: String,
      enum: Object.values(FriendRequestDeleted),
      default: FriendRequestDeleted.NO,
    },
  },
  {
    timestamps: true,
  },
);

const FriendRequestModel = mongoose.model<IFriendRequest>(
  "FriendRequests",
  friendRequestSchema,
);
export default FriendRequestModel;
