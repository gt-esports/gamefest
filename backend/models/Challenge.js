import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;
