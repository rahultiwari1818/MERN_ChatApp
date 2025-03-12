import mongoose, { Schema } from "mongoose";

const MessagesSchema = new Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
  readReceipts: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  deletedFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Custom validation: Either message or media is required
MessagesSchema.pre("save", function (next) {
  if (!this.message && (!this.media || this.media.length === 0)) {
    return next(new Error("Either message or media is required"));
  }
  next();
});

const Messages = mongoose.model("Messages", MessagesSchema);
export default Messages;
