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
      trim: true,
    },
    event:{
      type:String,
      default:""
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video", "audio", "file"], required: true },
      },
    ],
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

// Custom validation: Either message or media is required
GroupMessagesSchema.pre("save", function (next) {
  if (!this.message && (!this.media || this.media.length === 0)) {
    return next(new Error("Either message or media is required"));
  }
  next();
});

const GroupMessages = mongoose.model("GroupMessages", GroupMessagesSchema);
export default GroupMessages;
