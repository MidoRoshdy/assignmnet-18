import { Response } from "express";

export const successResponce = ({
  res,
  message = "success",
  data,
  status = 200,
}: {
  res: Response;
  message?: string;
  data?: any;
  status?: number;
}) => {
  return res.status(status).json({
    message,
    data,
  });
};
