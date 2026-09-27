import { Request, Response, NextFunction } from "express";
import { TokenService } from "../common/service/token.service";
import {
  BadRequestError,
  UnauthorizedError,
} from "../common/exeptions/error.responce";
import { redisService } from "../common/service/redis.service";
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        exp?: number;
      };
      token?: string;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    let [flag, token] = req.headers.authorization.split(" ");
    let decodedData = await new TokenService().decodeToken(token as string);
    if (decodedData) {
      req.user = decodedData as { id: string; exp?: number };
      req.token = token as string;
      let isRevoked = await redisService.exists({
        key: redisService.createrevokeToken({
          userId: req.user.id,
          token: token as string,
        }),
      });
      if (isRevoked) {
        throw new UnauthorizedError("Token has been revoked, login again");
      }
      next();
    } else {
      throw new BadRequestError("Invalid token");
    }
  } else {
    throw new BadRequestError("Unauthorized");
  }
};
