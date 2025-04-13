import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connection Established");
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
