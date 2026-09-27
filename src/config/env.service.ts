import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
const bcryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS;
const email = process.env.EMAIL;
const emailPass = process.env.EMAIL_PASS;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const clientUrl = process.env.CLIENT_URL;
const redisUrl = process.env.REDIS_URL;
const jwtSecretAdmin = process.env.JWT_SECRET_ADMIN;
const jwtSecretUser = process.env.JWT_SECRET_USER;
const jwtRefreshSecretAdmin = process.env.JWT_REFRESH_SECRET_ADMIN;
const jwtRefreshSecretUser = process.env.JWT_REFRESH_SECRET_USER;
export const env = {
  port,
  mongodbUri,
  jwtSecret,
  jwtAccessExpiresIn,
  jwtRefreshSecret,
  jwtRefreshExpiresIn,
  bcryptSaltRounds,
  email,
  emailPass,
  googleClientId,
  clientUrl,
  redisUrl,
  jwtSecretAdmin,
  jwtSecretUser,
  jwtRefreshSecretAdmin,
  jwtRefreshSecretUser,
};
