import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: String,
    players: [String], // display-only; synced from Player.teamAssignments
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teams: [teamSchema],
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
