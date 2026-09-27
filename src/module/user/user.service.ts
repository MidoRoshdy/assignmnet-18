import { isValidObjectId, Types } from "mongoose";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/exeptions/error.responce";
import { IUser } from "../../common/interfaces/user.interface";
import { IFriendRequest } from "../../common/interfaces/friendRequest.interface";
import {
  FriendRequestDeleted,
  FriendRequestStatus,
} from "../../common/enums/friend.interface";
import { compareHash, generatehash } from "../../common/security/security";
import UserModel from "../../database/models/user.model";
import FriendRequestModel from "../../database/models/friendRequest.model";
import { DsataBaseRepository } from "../../database/resposatory/database.reposatory";
import chatService from "../chat/chat.service";
import { realTimeGetway } from "../realtime/realTime.getway";

const userSelect = "firstName lastName email profilePicture";

export class UserService {
  private userReposatory: DsataBaseRepository<IUser>;
  private friendRequestReposatory: DsataBaseRepository<IFriendRequest>;

  constructor() {
    this.userReposatory = new DsataBaseRepository(UserModel);
    this.friendRequestReposatory = new DsataBaseRepository(FriendRequestModel);
  }

  //get logged in user profile with friends, friend requests and groups
  async getProfile(userId: string) {
    let user = await this.userReposatory.findbyId({
      id: userId,
      populate: { path: "friends", select: userSelect },
    });
    if (!user) {
      throw new NotFoundError("user not found");
    }
    let requests = await this.friendRequestReposatory.findAll({
      filter: {
        to: userId,
        status: FriendRequestStatus.PENDING,
        deleted: FriendRequestDeleted.NO,
      },
      populate: { path: "from", select: userSelect },
      sort: { createdAt: -1 },
    });
    let groups = await chatService.getGroups(userId);
    return {
      user: {
        ...user.toJSON(),
        friendRequests: requests
          .map((request: any) => request.from)
          .filter(Boolean),
      },
      groups,
    };
  }

  //get another user public profile
  async getUserProfile(userId: string) {
    let user = await this.userReposatory.findbyId({
      id: userId,
      select: "firstName lastName profilePicture gender createdAt",
    });
    if (!user) {
      throw new NotFoundError("user not found");
    }
    return user;
  }

  //update logged in user profile
  async updateProfile(userId: string, data: any) {
    let { username, ...rest } = data;
    if (username) {
      let [firstName, ...lastName] = username.trim().split(/\s+/);
      rest.firstName = firstName.toLowerCase();
      rest.lastName = lastName.join(" ").toLowerCase();
    }
    await this.userReposatory.updateone({ filter: { _id: userId }, data: rest });
    return await this.userReposatory.findbyId({ id: userId });
  }

  //change logged in user password
  async changePassword(
    userId: string,
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
  ) {
    let user = await this.userReposatory.findbyId({ id: userId });
    if (!user) {
      throw new NotFoundError("user not found");
    }
    let matchPassword = await compareHash({
      plainText: oldPassword,
      cypherText: user.password,
    });
    if (!matchPassword) {
      throw new BadRequestError("invalid old password");
    }
    let password = await generatehash({ plainText: newPassword });
    await this.userReposatory.updateone({
      filter: { _id: userId },
      data: { password },
    });
  }

  //send friend request by user id or email
  async sendFriendRequest(userId: string, friendIdentifier: string) {
    let friend = isValidObjectId(friendIdentifier)
      ? await this.userReposatory.findbyId({ id: friendIdentifier })
      : await this.userReposatory.findOne({
          filter: { email: friendIdentifier },
        });
    if (!friend) {
      throw new NotFoundError("user not found");
    }
    let friendId = friend._id.toString();
    if (friendId === userId) {
      throw new BadRequestError("you can't send a friend request to yourself");
    }
    if (friend.friends?.some((id: Types.ObjectId) => id.toString() === userId)) {
      throw new ConflictError("you are already friends");
    }
    let existingRequest = await this.friendRequestReposatory.findOne({
      filter: {
        $or: [
          { from: userId, to: friendId },
          { from: friendId, to: userId },
        ],
        status: FriendRequestStatus.PENDING,
        deleted: FriendRequestDeleted.NO,
      },
    });
    if (existingRequest) {
      throw new ConflictError(
        existingRequest.from.toString() === userId
          ? "friend request already sent"
          : "this user already sent you a friend request",
      );
    }
    let request = await this.friendRequestReposatory.create({
      from: new Types.ObjectId(userId),
      to: friend._id,
    });
    await realTimeGetway.emitToUser(friendId, "friendRequest", {
      from: userId,
    });
    return request;
  }

  //accept friend request
  async acceptFriendRequest(userId: string, friendId: string) {
    let request = await this.findPendingRequest(friendId, userId);
    await this.friendRequestReposatory.updateone({
      filter: { _id: request._id },
      data: { status: FriendRequestStatus.ACCEPTED },
    });
    await this.userReposatory.updateone({
      filter: { _id: userId },
      data: { $addToSet: { friends: friendId } },
    });
    await this.userReposatory.updateone({
      filter: { _id: friendId },
      data: { $addToSet: { friends: userId } },
    });
    await realTimeGetway.emitToUser(friendId, "friendRequestAccepted", {
      from: userId,
    });
  }

  //reject friend request
  async rejectFriendRequest(userId: string, friendId: string) {
    let request = await this.findPendingRequest(friendId, userId);
    await this.friendRequestReposatory.updateone({
      filter: { _id: request._id },
      data: { status: FriendRequestStatus.REJECTED },
    });
  }

  //cancel a sent friend request
  async cancelFriendRequest(userId: string, friendId: string) {
    let request = await this.findPendingRequest(userId, friendId);
    await this.friendRequestReposatory.updateone({
      filter: { _id: request._id },
      data: { deleted: FriendRequestDeleted.YES },
    });
  }

  //remove a friend
  async removeFriend(userId: string, friendId: string) {
    let user = await this.userReposatory.findOne({
      filter: { _id: userId, friends: friendId },
      select: "_id",
    });
    if (!user) {
      throw new NotFoundError("this user is not in your friends list");
    }
    await this.userReposatory.updateone({
      filter: { _id: userId },
      data: { $pull: { friends: friendId } },
    });
    await this.userReposatory.updateone({
      filter: { _id: friendId },
      data: { $pull: { friends: userId } },
    });
  }

  private async findPendingRequest(from: string, to: string) {
    let request = await this.friendRequestReposatory.findOne({
      filter: {
        from,
        to,
        status: FriendRequestStatus.PENDING,
        deleted: FriendRequestDeleted.NO,
      },
    });
    if (!request) {
      throw new NotFoundError("friend request not found");
    }
    return request;
  }
}

export default new UserService();
