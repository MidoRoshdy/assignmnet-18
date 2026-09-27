import { createClient, RedisClientType } from "redis";
import { env } from "../../config/env.service";
import { Types } from "mongoose";

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: env.redisUrl as string,
    });
    this.handleConnection();
  }

  async handleConnection() {
    this.client.on("error", (error) => {
      console.error("Redis error", error);
    });
    this.client.on("ready", () => {
      console.log("Redis client ready");
    });
    await this.client.connect();
  }

  createrevokeToken = ({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }): string => {
    return `revoke:${userId}:${token}`;
  };

  set = async ({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl: number;
  }) => {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    return ttl
      ? this.client.set(key, value, { EX: ttl })
      : this.client.set(key, value);
  };

  get = async ({ key }: { key: string }) => {
    return await this.client.get(key);
  };

  ttl = async ({ key }: { key: string }) => {
    return await this.client.ttl(key);
  };

  exists = async ({ key }: { key: string }) => {
    return await this.client.exists(key);
  };

  del = async ({ key }: { key: string }) => {
    return await this.client.del(key);
  };

  key(userId: Types.ObjectId) {
    return `user sockets : ${userId}`;
  }

  mget = async ({ keys }: { keys: string[] }) => {
    return await this.client.mGet(keys);
  };

  async addSocketToUser(userId: Types.ObjectId, socketId: string) {
    return await this.client.sAdd(this.key(userId), socketId);
  }

  async removeSocket(userId: Types.ObjectId, socketId: string) {
    return await this.client.sRem(this.key(userId), socketId);
  }

  async getUserSockets(userId: Types.ObjectId) {
    return await this.client.sMembers(this.key(userId));
  }

  createOtpKey = ({ type, email }: { type: string; email: string }) => {
    return `otp:${type}:${email}`;
  };
}

export const redisService = new RedisService();
