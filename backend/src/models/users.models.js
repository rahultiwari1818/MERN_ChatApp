import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
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
    createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
});

const User = mongoose.model("User",userSchema)

export default User;