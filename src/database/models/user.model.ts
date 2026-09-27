import mongoose from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import {
  UserConfirmEmsil,
  UserGender,
  userprovider,
  UserRole,
  UserStatus,
} from "../../common/enums/user.enum";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    confirmEmail: {
      type: String,
      default: UserConfirmEmsil.no,
    },
    gender: {
      type: String,
      default: UserGender.OTHER,
    },
    role: {
      type: String,
      default: UserRole.USER,
    },
    status: {
      type: String,
      default: UserStatus.INACTIVE,
    },
    provider: {
      type: String,
      default: userprovider.system,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);
userSchema
  .virtual("username")
  .set(function (value) {
    let [firstName, lastName] = value.split(" ");
    this.firstName = firstName.toLowerCase();
    this.lastName = lastName.toLowerCase();
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });
const UserModel = mongoose.model<IUser>("Users", userSchema);
export default UserModel;
