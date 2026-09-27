import { env } from "../../config/env.service";
import bcrypt, { hash } from "bcrypt";
export const generatehash = async ({
  plainText,
  salt = env.bcryptSaltRounds,
}: {
  plainText: string;
  salt?: string;
}): Promise<string> => {
  return await bcrypt.hash(plainText, Number(salt));
};

export const compareHash = async ({
  plainText,
  cypherText,
}: {
  plainText: string;
  cypherText: string;
}): Promise<boolean> => {
  return await bcrypt.compare(plainText, cypherText);
};
