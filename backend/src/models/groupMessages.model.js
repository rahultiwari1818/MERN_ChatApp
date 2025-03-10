import mongoose, { Schema } from "mongoose";

const GroupMessagesSchema = new Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readReceipts: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["delivered", "read"], default: "delivered" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const GroupMessages = mongoose.model("GroupMessages", GroupMessagesSchema);

export default GroupMessages;
