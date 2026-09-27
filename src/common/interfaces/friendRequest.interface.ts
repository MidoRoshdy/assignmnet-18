import { Types } from "mongoose";
import {
  FriendRequestDeleted,
  FriendRequestStatus,
} from "../enums/friend.interface";

export interface IFriendRequest {
  from: Types.ObjectId;
  to: Types.ObjectId;
  status?: FriendRequestStatus;
  deleted?: FriendRequestDeleted;
  createdAt?: Date;
  updatedAt?: Date;
}
