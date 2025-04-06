import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        trim:true
    },
    profilePic:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    lastSeen:{
        type:Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

});

const User = mongoose.model("User",userSchema)

export default User;