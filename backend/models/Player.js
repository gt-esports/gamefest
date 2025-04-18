import mongoose from "mongoose";

const teamAssignmentSchema = new mongoose.Schema(
  {
    game: String,
    team: String,
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  participation: [String],
  log: [String],
  teamAssignments: [teamAssignmentSchema],
  raffleWinner: { type: Boolean, default: false },
});

const Player = mongoose.model("Player", playerSchema);
export default Player;

// {game: "valorant", team: "team a"}