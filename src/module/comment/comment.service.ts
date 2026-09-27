import { Types } from "mongoose";
import {
  ForbiddenError,
  NotFoundError,
} from "../../common/exeptions/error.responce";
import { IComment } from "../../common/interfaces/comment.interface";
import {
  CommentDeleted,
  CommentStatus,
} from "../../common/enums/comment.enum";
import CommentModel from "../../database/models/comment.model";
import { DsataBaseRepository } from "../../database/resposatory/database.reposatory";
import postService from "../post/post.service";
import { realTimeGetway } from "../realtime/realTime.getway";

const userSelect = "firstName lastName profilePicture";

export class CommentService {
  private commentReposatory: DsataBaseRepository<IComment>;

  constructor() {
    this.commentReposatory = new DsataBaseRepository(CommentModel);
  }

  //add comment to a post the user can see
  async createComment(userId: string, postId: string, content: string) {
    let post = await postService.getPost(userId, postId);
    let comment = await this.commentReposatory.create({
      content,
      postId: post._id,
      createdBy: new Types.ObjectId(userId),
    });
    let ownerId = post.createdBy._id.toString();
    if (ownerId !== userId) {
      await realTimeGetway.emitToUser(ownerId, "newComment", {
        postId,
        commentId: comment._id,
        from: userId,
        content,
      });
    }
    return comment;
  }

  //get comments of a post (paginated)
  async getComments(
    userId: string,
    postId: string,
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    await postService.getPost(userId, postId);
    let filter = {
      postId,
      deleted: CommentDeleted.NO,
      status: CommentStatus.APPROVED,
    };
    let [comments, total] = await Promise.all([
      this.commentReposatory.findAll({
        filter,
        populate: { path: "createdBy", select: userSelect },
        sort: { createdAt: 1 },
        skip: (page - 1) * limit,
        limit,
      }),
      this.commentReposatory.count({ filter }),
    ]);
    return { comments, pagination: { page, limit, total } };
  }

  //update comment (comment owner only)
  async updateComment(userId: string, commentId: string, content: string) {
    let comment = await this.findComment(commentId);
    if (comment.createdBy.toString() !== userId) {
      throw new ForbiddenError("you can only update your own comments");
    }
    await this.commentReposatory.updateone({
      filter: { _id: comment._id },
      data: { content },
    });
    return await this.commentReposatory.findbyId({ id: commentId });
  }

  //delete comment (comment owner or post owner)
  async deleteComment(userId: string, commentId: string) {
    let comment = await this.findComment(commentId);
    if (comment.createdBy.toString() !== userId) {
      let post = await postService.getPost(userId, comment.postId.toString());
      if (post.createdBy._id.toString() !== userId) {
        throw new ForbiddenError("you are not allowed to delete this comment");
      }
    }
    await this.commentReposatory.updateone({
      filter: { _id: comment._id },
      data: { deleted: CommentDeleted.YES },
    });
  }

  private async findComment(commentId: string) {
    let comment = await this.commentReposatory.findOne({
      filter: { _id: commentId, deleted: CommentDeleted.NO },
    });
    if (!comment) {
      throw new NotFoundError("comment not found");
    }
    return comment;
  }
}

export default new CommentService();
