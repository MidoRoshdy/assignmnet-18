import { Types } from "mongoose";
import { randomUUID } from "crypto";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/exeptions/error.responce";
import { ChatType } from "../../common/enums/chat.enum";
import { IChat } from "../../common/interfaces/chat.interface";
import { IUser } from "../../common/interfaces/user.interface";
import ChatModel from "../../database/models/chat.model";
import UserModel from "../../database/models/user.model";
import { DsataBaseRepository } from "../../database/resposatory/database.reposatory";

const userSelect = "firstName lastName email profilePicture";

export class ChatService {
  private chatReposatory: DsataBaseRepository<IChat>;
  private userReposatory: DsataBaseRepository<IUser>;

  constructor() {
    this.chatReposatory = new DsataBaseRepository(ChatModel);
    this.userReposatory = new DsataBaseRepository(UserModel);
  }

  //get one to one chat between logged in user and another user
  async getChat(userId: string, friendId: string) {
    return await this.chatReposatory.findOne({
      filter: {
        type: ChatType.OVO,
        participants: { $all: [userId, friendId] },
      },
      populate: { path: "participants", select: userSelect },
    });
  }

  //get group chat (only for group members)
  async getGroupChat(userId: string, groupId: string) {
    let chat = await this.chatReposatory.findOne({
      filter: { _id: groupId, type: ChatType.GROUP, participants: userId },
      populate: [
        { path: "participants", select: userSelect },
        { path: "message.createdBy", select: userSelect },
      ],
    });
    if (!chat) {
      throw new NotFoundError("group not found");
    }
    return chat;
  }

  //get all groups of a user
  async getGroups(userId: string) {
    return await this.chatReposatory.findAll({
      filter: { type: ChatType.GROUP, participants: userId },
      select: "group group_image roomId participants createdBy",
    });
  }

  //create a new group
  async createGroup(
    userId: string,
    data: { group: string; participants: string[]; group_image?: string },
  ) {
    let participants = [...new Set([userId, ...data.participants])];
    let usersCount = await this.userReposatory.count({
      filter: { _id: { $in: participants } },
    });
    if (usersCount !== participants.length) {
      throw new NotFoundError("some participants not found");
    }
    return await this.chatReposatory.create({
      participants: participants.map((id) => new Types.ObjectId(id)),
      type: ChatType.GROUP,
      group: data.group,
      ...(data.group_image && { group_image: data.group_image }),
      roomId: randomUUID(),
      createdBy: new Types.ObjectId(userId),
      message: [],
    });
  }

  //send a one to one message (only between friends)
  async sendMessage(
    userId: string,
    { content, sendTo }: { content: string; sendTo: string },
  ) {
    if (userId === sendTo) {
      throw new BadRequestError("you can't send a message to yourself");
    }
    let isFriend = await this.userReposatory.findOne({
      filter: { _id: userId, friends: sendTo },
      select: "_id",
    });
    if (!isFriend) {
      throw new ForbiddenError("you can only send messages to your friends");
    }
    let message = { content, createdBy: new Types.ObjectId(userId) };
    let chat = await this.chatReposatory.findOne({
      filter: { type: ChatType.OVO, participants: { $all: [userId, sendTo] } },
      select: "_id",
    });
    if (chat) {
      await this.chatReposatory.updateone({
        filter: { _id: chat._id },
        data: { $push: { message } },
      });
    } else {
      await this.chatReposatory.create({
        participants: [new Types.ObjectId(userId), new Types.ObjectId(sendTo)],
        type: ChatType.OVO,
        createdBy: new Types.ObjectId(userId),
        message: [message],
      });
    }
    return { content, sendTo };
  }

  //send a group message (only for group members)
  async sendGroupMessage(
    userId: string,
    { content, groupId }: { content: string; groupId: string },
  ) {
    let chat = await this.chatReposatory.findOne({
      filter: { _id: groupId, type: ChatType.GROUP, participants: userId },
      select: "_id roomId",
    });
    if (!chat) {
      throw new NotFoundError("group not found");
    }
    await this.chatReposatory.updateone({
      filter: { _id: chat._id },
      data: {
        $push: { message: { content, createdBy: new Types.ObjectId(userId) } },
      },
    });
    return chat;
  }

  //check if user is a member of the room
  async canJoinRoom(userId: string, roomId: string) {
    let chat = await this.chatReposatory.findOne({
      filter: { roomId, participants: userId },
      select: "_id",
    });
    return !!chat;
  }
}

export default new ChatService();
