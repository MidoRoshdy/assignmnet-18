import { Router, Request, Response } from "express";
import commentService from "./comment.service";
import { successResponce } from "../../common/exeptions/success.responce";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import {
  commentIdSchema,
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from "./comment.validation";

const commentRouter: Router = Router();

//add comment to a post
commentRouter.post(
  "/post/:postId",
  auth,
  validation(createCommentSchema),
  async (req: Request, res: Response) => {
    let comment = await commentService.createComment(
      req.user?.id as string,
      req.params.postId as string,
      req.body.content,
    );
    successResponce({
      res,
      message: "Comment added successfully",
      data: comment,
      status: 201,
    });
  },
);

//get comments of a post
commentRouter.get(
  "/post/:postId",
  auth,
  validation(getCommentsSchema),
  async (req: Request, res: Response) => {
    let comments = await commentService.getComments(
      req.user?.id as string,
      req.params.postId as string,
      {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      },
    );
    successResponce({
      res,
      message: "Comments fetched successfully",
      data: comments,
    });
  },
);

//update a comment
commentRouter.patch(
  "/:commentId",
  auth,
  validation(updateCommentSchema),
  async (req: Request, res: Response) => {
    let comment = await commentService.updateComment(
      req.user?.id as string,
      req.params.commentId as string,
      req.body.content,
    );
    successResponce({
      res,
      message: "Comment updated successfully",
      data: comment,
    });
  },
);

//delete a comment
commentRouter.delete(
  "/:commentId",
  auth,
  validation(commentIdSchema),
  async (req: Request, res: Response) => {
    await commentService.deleteComment(
      req.user?.id as string,
      req.params.commentId as string,
    );
    successResponce({
      res,
      message: "Comment deleted successfully",
    });
  },
);

export default commentRouter;
