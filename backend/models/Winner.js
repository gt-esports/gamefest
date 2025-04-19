import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
  game: { type: String, required: true },
  matchId: { type: String, required: true },
  winner: { type: String, required: true },
});

const Winner = mongoose.model("Winner", winnerSchema);
export default Winner;
