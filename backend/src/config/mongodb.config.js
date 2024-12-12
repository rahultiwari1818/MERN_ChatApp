import mongoose from "mongoose";

 const connectToMongo = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");
        
    } catch (error) {
        console.log("Error in Connecting to db...",error);
        process.exit(1);
    }
} 

export default connectToMongo;