import mongoose,{Schema} from "mongoose";

const MesssagesSchema = new Schema({
    senderId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId
    },
    recipientId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId
    },
    message:{
        required:true,
        type:String
    },
    timestamp:{
        required:true,
        type:Date,
        default:Date.now()
    },
});

const Messages = mongoose.model("Messages",MesssagesSchema);

export default Messages;
