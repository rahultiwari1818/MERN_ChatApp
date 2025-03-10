import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Messages",
				default: [],
			},
		],
		lastMessage:{
			required:true,
			default:"",
			type:String
		},
		lastMessageTime:{
			required:true,
			default:Date.now,
			type:Date
		}
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;