import { userModel } from "../model/userModel.js";
import bcrypt from "bcrypt";
import asyncWrapper from "../middleware/asyncWrapper.js";
import * as httpStatusText from "../utils/httpStatusText.js";
import appError from "../utils/appError.js";
import generateJWT from "../utils/generateJWT.js";
export const register = asyncWrapper(async (req, res, next) => {
  const { username, email, password } = req.body;
  const isUser = await userModel.findOne({ username });
  if (isUser)
    return next(
      appError.create("Username already used", 400, httpStatusText.FAIL)
    );
  const isEmail = await userModel.findOne({ email });
  if (isEmail)
    return next(
      appError.create("Email already used", 400, httpStatusText.FAIL)
    );
  if (!password)
    return next(
      appError.create("Password is required", 400, httpStatusText.FAIL)
    );
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUND)
  );
  const user = await userModel.create({
    email,
    username,
    password: hashedPassword,
  });
  delete user.password;
  return res.json({ status: httpStatusText.SUCCESS, user });
});

export const login = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user)
    return next(
      appError.create(
        "incorrect username or password",
        400,
        httpStatusText.FAIL
      )
    );

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword)
    return next(
      appError.create(
        "incorrect username or password",
        400,
        httpStatusText.FAIL
      )
    );
  if (user && matchedPassword) {
    const token = await generateJWT({
      _id: user._id,
      username: user.username,
      email: user.username,
      avatarImage: user.avatarImage,
      role: user.role,
      isAvatarImageSet: user.isAvatarImageSet,
    });
    return res.json({ status: httpStatusText.SUCCESS, token });
  }
  delete user.password;
});

export const setAvatar = asyncWrapper(async (req, res, next) => {
  const userId = req.params.id;
  const avatarImage = req.body.image;
  const userData = await userModel.findByIdAndUpdate(userId, {
    isAvatarImageSet: true,
    avatarImage,
  });
  return res.json({
    status: httpStatusText.SUCCESS,
    isSet: userData.isAvatarImageSet,
    image: userData.avatarImage,
  });
});

export const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await userModel
    .find({ _id: { $ne: req.params.id } })
    .select(["email", "username", "avatarImage", "_id"]);
  return res.json({ status: httpStatusText.SUCCESS, users });
});

export const getUser = asyncWrapper(async (req, res, next) => {
  let { id } = req.params;
  const user = await userModel
    .find({ _id: id })
    .select(["email", "username", "avatarImage", "_id"]);
  return res.json({ status: httpStatusText.SUCCESS, user });
});
