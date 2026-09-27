import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const createCommentSchema = z.object({
  params: z.object({
    postId: generalFields.id,
  }),
  body: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    postId: generalFields.id,
  }),
  query: z.object({
    page: generalFields.page,
    limit: generalFields.limit,
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    commentId: generalFields.id,
  }),
  body: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
});

export const commentIdSchema = z.object({
  params: z.object({
    commentId: generalFields.id,
  }),
});
