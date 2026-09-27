import { Types } from "mongoose";
import { ChatType } from "../enums/chat.enum";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
}

export interface IChat {
  participants: Types.ObjectId[];
  message?: IMessage[];
  type: ChatType;
  group?: string;
  group_image?: string;
  roomId?: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
