import asyncWrapper from "../middleware/asyncWrapper.js";
import { messageModel } from "../model/messageModel.js";
import * as httpStatusText from "../utils/httpStatusText.js";
export const addMessage = asyncWrapper(async (req, res, next) => {
  const { from, to, message } = req.body;
  const data = await messageModel.create({
    message: { text: message },
    users: [from, to],
    sender: from,
  });
  if (data)
    return res.json({
      status: httpStatusText.SUCCESS,
      msg: "Message addedd successfuly",
    });
  return res.json({
    status: httpStatusText.FAIL,
    msg: "Failed to add message to the Database",
  });
});
export const getAllMessage = asyncWrapper(async (req, res, next) => {
  const { from, to } = req.body;
  const messages = await messageModel
    .find({
      users: {
        $all: [from, to],
      },
    })
    .sort({ updatedAt: 1 });

  const projectMessages = messages.map((msg) => {
    return {
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    };
  });
  return res.json(projectMessages);
});
