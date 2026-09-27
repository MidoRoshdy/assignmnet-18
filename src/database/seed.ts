import mongoose, { Types } from "mongoose";
import { randomUUID } from "crypto";
import { connectDB } from "./connection";
import { generatehash } from "../common/security/security";
import {
  ChatType,
  FriendRequestStatus,
  PostVisibility,
  UserConfirmEmsil,
  UserGender,
  UserStatus,
} from "../common";
import UserModel from "./models/user.model";
import PostModel from "./models/post.model";
import CommentModel from "./models/comment.model";
import FriendRequestModel from "./models/friendRequest.model";
import ChatModel from "./models/chat.model";

const password = "123456";

const seedUsers = [
  { username: "ali ahmed", email: "ali@test.com", gender: UserGender.MALE },
  { username: "sara mohamed", email: "sara@test.com", gender: UserGender.FEMALE },
  { username: "omar khaled", email: "omar@test.com", gender: UserGender.MALE },
  { username: "mona hassan", email: "mona@test.com", gender: UserGender.FEMALE },
];

const seed = async () => {
  await connectDB();

  //remove old seed data so the script can run more than once
  let oldUsers = await UserModel.find({
    email: { $in: seedUsers.map((user) => user.email) },
  }).select("_id");
  let oldIds = oldUsers.map((user) => user._id);
  await Promise.all([
    PostModel.deleteMany({ createdBy: { $in: oldIds } }),
    CommentModel.deleteMany({ createdBy: { $in: oldIds } }),
    FriendRequestModel.deleteMany({
      $or: [{ from: { $in: oldIds } }, { to: { $in: oldIds } }],
    }),
    ChatModel.deleteMany({ participants: { $in: oldIds } }),
    UserModel.deleteMany({ _id: { $in: oldIds } }),
  ]);

  //users
  let hashedPassword = await generatehash({ plainText: password });
  let [ali, sara, omar, mona] = await UserModel.create(
    seedUsers.map((user) => {
      let [firstName, lastName] = user.username.split(" ") as [string, string];
      return {
        firstName,
        lastName,
        email: user.email,
        password: hashedPassword,
        gender: user.gender,
        phone: "01000000000",
        confirmEmail: UserConfirmEmsil.yes,
        status: UserStatus.ACTIVE,
      };
    }),
  );
  if (!ali || !sara || !omar || !mona) throw new Error("failed to seed users");

  //friends: ali <-> sara, ali <-> omar, sara <-> omar
  await UserModel.updateOne({ _id: ali._id }, { friends: [sara._id, omar._id] });
  await UserModel.updateOne({ _id: sara._id }, { friends: [ali._id, omar._id] });
  await UserModel.updateOne({ _id: omar._id }, { friends: [ali._id, sara._id] });

  //friend requests: accepted ones + a pending one from mona to ali
  await FriendRequestModel.create([
    { from: ali._id, to: sara._id, status: FriendRequestStatus.ACCEPTED },
    { from: omar._id, to: ali._id, status: FriendRequestStatus.ACCEPTED },
    { from: sara._id, to: omar._id, status: FriendRequestStatus.ACCEPTED },
    { from: mona._id, to: ali._id, status: FriendRequestStatus.PENDING },
  ]);

  //posts
  let [aliPost, saraPost, saraPrivatePost] = await PostModel.create([
    {
      content: "Hello everyone, this is my first post!",
      createdBy: ali._id,
      likes: [sara._id, omar._id],
    },
    {
      content: "Beautiful day today",
      createdBy: sara._id,
      likes: [ali._id],
    },
    {
      content: "Only my friends can see this post",
      createdBy: sara._id,
      visibility: PostVisibility.PRIVATE,
    },
    {
      content: "Learning Node.js and Socket.io",
      createdBy: omar._id,
    },
    {
      content: "Hi, I am new here",
      createdBy: mona._id,
    },
  ]);
  if (!aliPost || !saraPost || !saraPrivatePost) {
    throw new Error("failed to seed posts");
  }

  //comments
  await CommentModel.create([
    { content: "Welcome Ali!", postId: aliPost._id, createdBy: sara._id },
    { content: "Nice post", postId: aliPost._id, createdBy: omar._id },
    { content: "Enjoy it", postId: saraPost._id, createdBy: ali._id },
    { content: "Thanks for sharing", postId: saraPrivatePost._id, createdBy: omar._id },
  ]);

  //one to one chat between ali and sara
  await ChatModel.create({
    participants: [ali._id, sara._id],
    type: ChatType.OVO,
    createdBy: ali._id,
    message: [
      { content: "Hi Sara", createdBy: ali._id },
      { content: "Hi Ali, how are you?", createdBy: sara._id },
      { content: "Fine, thanks!", createdBy: ali._id },
    ],
  });

  //group chat
  await ChatModel.create({
    participants: [ali._id, sara._id, omar._id],
    type: ChatType.GROUP,
    group: "Node.js Team",
    roomId: randomUUID(),
    createdBy: ali._id,
    message: [
      { content: "Welcome to the team", createdBy: ali._id },
      { content: "Happy to be here", createdBy: omar._id },
    ],
  });

  console.log("Seed completed. Users (password: 123456):");
  for (let user of [ali, sara, omar, mona]) {
    console.log(`  ${user.email} -> ${(user._id as Types.ObjectId).toString()}`);
  }
};

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
