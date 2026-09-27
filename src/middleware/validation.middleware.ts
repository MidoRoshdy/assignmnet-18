import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { BadRequestError } from "../common/exeptions/error.responce";

export const generalFields = {
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

export const validation = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let validationResult = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!validationResult.success) {
      throw new BadRequestError(
        "Validation failed",
        validationResult.error.message,
      );
    }
    next();
  };
};
