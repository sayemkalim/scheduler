import mongoose, { Mongoose } from "mongoose";

const handle_connect_to_mongo = async (mongo_uri: string) => {
 try {
   const connection: Mongoose = await mongoose.connect(mongo_uri);
   console.log(`MongoDB connected: ${connection.connection.host}`);
 } catch (error) {
   console.error("Error connecting to MongoDB:", error);
   process.exit(1);
 }
}

export default handle_connect_to_mongo;
