import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectWithDataBase = () => {
  mongoose.connect(process.env.mongoDBURL, () => {
    console.log("connected to mongoDB Database");
  });
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
};
export default connectWithDataBase;
