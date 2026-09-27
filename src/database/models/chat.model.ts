import mongoose from "mongoose";
import { IChat, IMessage } from "../../common/interfaces/chat.interface";
import { ChatType } from "../../common/enums/chat.enum";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const chatSchema = new mongoose.Schema<IChat>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    message: [messageSchema],
    type: {
      type: String,
      enum: Object.values(ChatType),
      default: ChatType.OVO,
    },
    group: {
      type: String,
    },
    group_image: {
      type: String,
    },
    roomId: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ChatModel = mongoose.model<IChat>("Chats", chatSchema);
export default ChatModel;
