import { z } from "zod";
import { PostStatus, PostVisibility } from "../../common";
import { generalFields } from "../../middleware/validation.middleware";

const postStatus = z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED]);

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(5000),
    attachments: z.array(z.string()).optional(),
    visibility: z.enum(PostVisibility).optional(),
    status: postStatus.optional(),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    postId: generalFields.id,
  }),
  body: z
    .object({
      content: z.string().trim().min(1).max(5000).optional(),
      attachments: z.array(z.string()).optional(),
      visibility: z.enum(PostVisibility).optional(),
      status: postStatus.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "at least one field is required",
    }),
});

export const postIdSchema = z.object({
  params: z.object({
    postId: generalFields.id,
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    page: generalFields.page,
    limit: generalFields.limit,
  }),
});

export const getUserPostsSchema = z.object({
  params: z.object({
    userId: generalFields.id,
  }),
  query: z.object({
    page: generalFields.page,
    limit: generalFields.limit,
  }),
});
