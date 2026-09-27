import { env } from "../../config/env.service";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../exeptions/error.responce";
export class TokenService {
  constructor() {}

  async generateToken(user: any) {
    let signature = undefined;
    let audiance = undefined;
    let refreshSignature = undefined;
    switch (user.role) {
      case "admin":
        signature = env.jwtSecretAdmin;
        audiance = "admin";
        refreshSignature = env.jwtRefreshSecretAdmin;
        break;
      default:
        signature = env.jwtSecretUser;
        audiance = "user";
        refreshSignature = env.jwtRefreshSecretUser;
        break;
    }

    let accessToken = jwt.sign({ id: user._id }, signature as string, {
      audience: audiance,
      expiresIn: "30d",
    });
    let refreshToken = jwt.sign({ id: user._id }, refreshSignature as string, {
      audience: audiance,
      expiresIn: "1y",
    });
    return { accessToken, refreshToken };
  }

  async decodeToken(token: string) {
    try {
      let decoded = jwt.decode(token) as jwt.JwtPayload;
      if (!decoded) {
        throw new BadRequestError("Invalid token");
      }
      let signature = undefined;
      const audience = Array.isArray(decoded.aud)
        ? decoded.aud[0]
        : decoded.aud;
      switch (audience) {
        case "admin":
          signature = env.jwtSecretAdmin;
          break;
        default:
          signature = env.jwtSecretUser;
          break;
      }
      let decodedData = jwt.verify(token, signature as string);
      if (decodedData) {
        return decodedData;
      } else {
        throw new BadRequestError("Invalid token");
      }
    } catch (error) {
      throw new BadRequestError("Invalid token", error);
    }
  }

  async decodedRefreshToken(refreshToken: string) {
    let decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
    if (!decoded) {
      throw new BadRequestError("Invalid refresh token");
    }
    let signature = undefined;
    const audience = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
    switch (audience) {
      case "admin":
        signature = env.jwtRefreshSecretAdmin;
        break;
      default:
        signature = env.jwtRefreshSecretUser;
        break;
    }
    let decodedData = jwt.verify(refreshToken, signature as string);
    if (!decodedData) {
      throw new BadRequestError("Invalid refresh token");
    }
    return decodedData;
  }
}
