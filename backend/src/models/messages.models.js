import mongoose,{Schema} from "mongoose";

const MesssagesSchema = new Schema({
    senderId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    recipientId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    message:{
        required:true,
        type:String
    },
    isSent:{
        type:Boolean,
        default:false
    },
    isReceived:{
        type:Boolean,
        default:false
    },
    isRead:{
        type:Boolean,
        default:false
    },
    timestamp:{
        required:true,
        type:Date,
        default:Date.now
    },
});

const Messages = mongoose.model("Messages",MesssagesSchema);

export default Messages;

