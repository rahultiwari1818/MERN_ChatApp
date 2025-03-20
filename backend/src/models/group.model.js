import mongoose, { Schema } from "mongoose";

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["member", "admin"], default: "member" }, 
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupIcon: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 300,
      default: "",
    },
    lastMessage:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"GroupMessages",
      default:null
    }
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

export default Group;
