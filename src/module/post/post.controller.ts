import { Router, Request, Response } from "express";
import postService from "./post.service";
import { successResponce } from "../../common/exeptions/success.responce";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import {
  createPostSchema,
  getPostsSchema,
  getUserPostsSchema,
  postIdSchema,
  updatePostSchema,
} from "./post.validation";

const postRouter: Router = Router();

//create a post
postRouter.post(
  "/",
  auth,
  validation(createPostSchema),
  async (req: Request, res: Response) => {
    let post = await postService.createPost(req.user?.id as string, req.body);
    successResponce({
      res,
      message: "Post created successfully",
      data: post,
      status: 201,
    });
  },
);

//get feed
postRouter.get(
  "/",
  auth,
  validation(getPostsSchema),
  async (req: Request, res: Response) => {
    let posts = await postService.getPosts(req.user?.id as string, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });
    successResponce({
      res,
      message: "Posts fetched successfully",
      data: posts,
    });
  },
);

//get posts of a user
postRouter.get(
  "/user/:userId",
  auth,
  validation(getUserPostsSchema),
  async (req: Request, res: Response) => {
    let posts = await postService.getUserPosts(
      req.user?.id as string,
      req.params.userId as string,
      {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      },
    );
    successResponce({
      res,
      message: "Posts fetched successfully",
      data: posts,
    });
  },
);

//get one post
postRouter.get(
  "/:postId",
  auth,
  validation(postIdSchema),
  async (req: Request, res: Response) => {
    let post = await postService.getPost(
      req.user?.id as string,
      req.params.postId as string,
    );
    successResponce({
      res,
      message: "Post fetched successfully",
      data: post,
    });
  },
);

//update a post
postRouter.patch(
  "/:postId",
  auth,
  validation(updatePostSchema),
  async (req: Request, res: Response) => {
    let post = await postService.updatePost(
      req.user?.id as string,
      req.params.postId as string,
      req.body,
    );
    successResponce({
      res,
      message: "Post updated successfully",
      data: post,
    });
  },
);

//delete a post
postRouter.delete(
  "/:postId",
  auth,
  validation(postIdSchema),
  async (req: Request, res: Response) => {
    await postService.deletePost(
      req.user?.id as string,
      req.params.postId as string,
    );
    successResponce({
      res,
      message: "Post deleted successfully",
    });
  },
);

//like / unlike a post
postRouter.patch(
  "/:postId/like",
  auth,
  validation(postIdSchema),
  async (req: Request, res: Response) => {
    let result = await postService.toggleLike(
      req.user?.id as string,
      req.params.postId as string,
    );
    successResponce({
      res,
      message: result.liked ? "Post liked" : "Post unliked",
      data: result,
    });
  },
);

export default postRouter;
