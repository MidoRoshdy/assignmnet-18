import { Types } from "mongoose";
import { NotFoundError } from "../../common/exeptions/error.responce";
import { IPost } from "../../common/interfaces/post.interface";
import { IUser } from "../../common/interfaces/user.interface";
import { IComment } from "../../common/interfaces/comment.interface";
import {
  PostDeleted,
  PostStatus,
  PostVisibility,
} from "../../common/enums/post.enum";
import { CommentDeleted } from "../../common/enums/comment.enum";
import PostModel from "../../database/models/post.model";
import UserModel from "../../database/models/user.model";
import CommentModel from "../../database/models/comment.model";
import { DsataBaseRepository } from "../../database/resposatory/database.reposatory";
import { realTimeGetway } from "../realtime/realTime.getway";

const userSelect = "firstName lastName profilePicture";

export class PostService {
  private postReposatory: DsataBaseRepository<IPost>;
  private userReposatory: DsataBaseRepository<IUser>;
  private commentReposatory: DsataBaseRepository<IComment>;

  constructor() {
    this.postReposatory = new DsataBaseRepository(PostModel);
    this.userReposatory = new DsataBaseRepository(UserModel);
    this.commentReposatory = new DsataBaseRepository(CommentModel);
  }

  //posts the user is allowed to see:
  //his own posts, public published posts and private published posts of his friends
  private async visibilityFilter(userId: string) {
    let user = await this.userReposatory.findbyId({
      id: userId,
      select: "friends",
    });
    return {
      deleted: PostDeleted.NO,
      $or: [
        { createdBy: userId },
        { visibility: PostVisibility.PUBLIC, status: PostStatus.PUBLISHED },
        {
          visibility: PostVisibility.PRIVATE,
          status: PostStatus.PUBLISHED,
          createdBy: { $in: user?.friends || [] },
        },
      ],
    };
  }

  //create a post
  async createPost(userId: string, data: any) {
    return await this.postReposatory.create({
      ...data,
      createdBy: new Types.ObjectId(userId),
    });
  }

  //get feed (paginated)
  async getPosts(
    userId: string,
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    let filter = await this.visibilityFilter(userId);
    let [posts, total] = await Promise.all([
      this.postReposatory.findAll({
        filter,
        populate: { path: "createdBy", select: userSelect },
        sort: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit,
      }),
      this.postReposatory.count({ filter }),
    ]);
    return { posts, pagination: { page, limit, total } };
  }

  //get posts of a specific user (paginated)
  async getUserPosts(
    userId: string,
    ownerId: string,
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    let filter = {
      ...(await this.visibilityFilter(userId)),
      createdBy: ownerId,
    };
    let [posts, total] = await Promise.all([
      this.postReposatory.findAll({
        filter,
        populate: { path: "createdBy", select: userSelect },
        sort: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit,
      }),
      this.postReposatory.count({ filter }),
    ]);
    return { posts, pagination: { page, limit, total } };
  }

  //get one post
  async getPost(userId: string, postId: string) {
    let post = await this.postReposatory.findOne({
      filter: { ...(await this.visibilityFilter(userId)), _id: postId },
      populate: { path: "createdBy", select: userSelect },
    });
    if (!post) {
      throw new NotFoundError("post not found");
    }
    return post;
  }

  //update a post (owner only)
  async updatePost(userId: string, postId: string, data: any) {
    let post = await this.findOwnPost(userId, postId);
    await this.postReposatory.updateone({ filter: { _id: post._id }, data });
    return await this.postReposatory.findbyId({ id: postId });
  }

  //soft delete a post and its comments (owner only)
  async deletePost(userId: string, postId: string) {
    let post = await this.findOwnPost(userId, postId);
    await this.postReposatory.updateone({
      filter: { _id: post._id },
      data: { deleted: PostDeleted.YES },
    });
    await this.commentReposatory.updateMany({
      filter: { postId: post._id },
      data: { deleted: CommentDeleted.YES },
    });
  }

  //like / unlike a post
  async toggleLike(userId: string, postId: string) {
    let post = await this.getPost(userId, postId);
    let isLiked = post.likes.some(
      (id: Types.ObjectId) => id.toString() === userId,
    );
    await this.postReposatory.updateone({
      filter: { _id: post._id },
      data: isLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
    });
    let ownerId = post.createdBy._id.toString();
    if (!isLiked && ownerId !== userId) {
      await realTimeGetway.emitToUser(ownerId, "likePost", {
        postId,
        likedBy: userId,
      });
    }
    return {
      liked: !isLiked,
      likesCount: post.likes.length + (isLiked ? -1 : 1),
    };
  }

  private async findOwnPost(userId: string, postId: string) {
    let post = await this.postReposatory.findOne({
      filter: { _id: postId, createdBy: userId, deleted: PostDeleted.NO },
    });
    if (!post) {
      throw new NotFoundError("post not found");
    }
    return post;
  }
}

export default new PostService();
