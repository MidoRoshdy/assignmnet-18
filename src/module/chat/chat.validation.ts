import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const getChatSchema = z.object({
  params: z.object({
    userId: generalFields.id,
  }),
});

export const getGroupChatSchema = z.object({
  params: z.object({
    groupId: generalFields.id,
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    group: z.string().min(2).max(50),
    participants: z.array(generalFields.id).min(1),
    group_image: z.string().optional(),
  }),
});

// socket events
export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  sendTo: generalFields.id,
});

export const sendGroupMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  groupId: generalFields.id,
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(1),
});
