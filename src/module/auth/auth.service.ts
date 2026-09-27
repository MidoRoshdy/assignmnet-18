import { randomInt } from "crypto";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../common/exeptions/error.responce";
import { IUser } from "../../common/interfaces/user.interface";
import { UserConfirmEmsil, UserStatus } from "../../common/enums/user.enum";
import { compareHash, generatehash } from "../../common/security/security";
import { TokenService } from "../../common/service/token.service";
import { redisService } from "../../common/service/redis.service";
import { sendEmail } from "../../common/email/sendEmail";
import UserModel from "../../database/models/user.model";
import { DsataBaseRepository } from "../../database/resposatory/database.reposatory";

type OtpType = "confirm" | "reset";

export class AuthService {
  private userReposatory: DsataBaseRepository<IUser>;
  private tokenService: TokenService;

  constructor() {
    this.userReposatory = new DsataBaseRepository(UserModel);
    this.tokenService = new TokenService();
  }
  //register a new user
  async register(data: any) {
    if (data.username) {
      let [firstName, lastName] = data.username.split(" ");
      data.firstName = firstName.toLowerCase();
      data.lastName = lastName.toLowerCase();
    }
    let encreptedPassword = await generatehash({ plainText: data.password });
    data.password = encreptedPassword;

    let newUser = await this.userReposatory.create(data);
    if (newUser) {
      await this.sendOtp(newUser.email, "confirm");
      return newUser;
    }
    throw new BadRequestError("something went wrong");
  }

  //login a user
  async login(data: any) {
    let { email, password } = data;
    let userData = await this.userReposatory.findOne({ filter: { email } });
    if (userData) {
      let matchPassword = await compareHash({
        plainText: password,
        cypherText: userData.password,
      });
      if (matchPassword) {
        let { accessToken, refreshToken } =
          await this.tokenService.generateToken(userData);
        return {
          userData,
          accessToken,
          refreshToken,
        };
      } else {
        throw new BadRequestError("invalid password");
      }
    } else {
      throw new NotFoundError("user not found");
    }
  }

  //get new access and refresh tokens
  async refreshToken({ refreshToken }: { refreshToken: string }) {
    let decoded: any;
    try {
      decoded = await this.tokenService.decodedRefreshToken(refreshToken);
    } catch (error) {
      throw new BadRequestError("Invalid refresh token", error);
    }
    let userData = await this.userReposatory.findbyId({ id: decoded.id });
    if (!userData) {
      throw new NotFoundError("user not found");
    }
    return await this.tokenService.generateToken(userData);
  }

  //logout (revoke the current access token until it expires)
  async logout(userId: string, token: string, exp?: number) {
    let ttl = exp ? exp - Math.floor(Date.now() / 1000) : 0;
    if (ttl > 0) {
      await redisService.set({
        key: redisService.createrevokeToken({ userId, token }),
        value: "revoked",
        ttl,
      });
    }
  }

  //confirm email with otp
  async confirmEmail({ email, otp }: { email: string; otp: string }) {
    let userData = await this.userReposatory.findOne({ filter: { email } });
    if (!userData) {
      throw new NotFoundError("user not found");
    }
    if (userData.confirmEmail === UserConfirmEmsil.yes) {
      throw new ConflictError("email already confirmed");
    }
    await this.verifyOtp(email, "confirm", otp);
    await this.userReposatory.updateone({
      filter: { _id: userData._id },
      data: { confirmEmail: UserConfirmEmsil.yes, status: UserStatus.ACTIVE },
    });
  }

  //resend confirm email otp
  async resendConfirmEmail({ email }: { email: string }) {
    let userData = await this.userReposatory.findOne({ filter: { email } });
    if (!userData) {
      throw new NotFoundError("user not found");
    }
    if (userData.confirmEmail === UserConfirmEmsil.yes) {
      throw new ConflictError("email already confirmed");
    }
    await this.sendOtp(email, "confirm");
  }

  //send reset password otp
  async forgetPassword({ email }: { email: string }) {
    let userData = await this.userReposatory.findOne({ filter: { email } });
    if (!userData) {
      throw new NotFoundError("user not found");
    }
    await this.sendOtp(email, "reset");
  }

  //reset password with otp
  async resetPassword({
    email,
    otp,
    password,
  }: {
    email: string;
    otp: string;
    password: string;
  }) {
    let userData = await this.userReposatory.findOne({ filter: { email } });
    if (!userData) {
      throw new NotFoundError("user not found");
    }
    await this.verifyOtp(email, "reset", otp);
    let encreptedPassword = await generatehash({ plainText: password });
    await this.userReposatory.updateone({
      filter: { _id: userData._id },
      data: { password: encreptedPassword },
    });
  }

  private async sendOtp(email: string, type: OtpType) {
    let otp = randomInt(100000, 1000000).toString();
    await redisService.set({
      key: redisService.createOtpKey({ type, email }),
      value: await generatehash({ plainText: otp }),
      ttl: 10 * 60,
    });
    try {
      await sendEmail({
        to: email,
        subject: type === "confirm" ? "Confirm your email" : "Reset password",
        html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
      });
    } catch (error) {
      console.error("Failed to send email", error);
    }
  }

  private async verifyOtp(email: string, type: OtpType, otp: string) {
    let key = redisService.createOtpKey({ type, email });
    let hashedOtp = await redisService.get({ key });
    if (!hashedOtp) {
      throw new BadRequestError("otp expired or not found");
    }
    let matchOtp = await compareHash({ plainText: otp, cypherText: hashedOtp });
    if (!matchOtp) {
      throw new BadRequestError("invalid otp");
    }
    await redisService.del({ key });
  }
}

export default new AuthService();
