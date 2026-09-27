import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    stack: err.stack || "No stack trace available",
    cause: err.cause || "No cause available",
    err,
  });
};
