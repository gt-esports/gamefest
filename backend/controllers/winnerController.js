import Winner from "../models/Winner.js";

// GET /api/winners → Get all winners
const getAllWinners = async (req, res) => {
  const winners = await Winner.find();
  res.json(winners);
};

// GET /api/winners/:game → Get all winners for a specific game
const getWinnersByGame = async (req, res) => {
  const winners = await Winner.find({ game: req.params.game });
  res.json(winners);
};

// POST /api/winners → Create or update a winner for a match
const upsertWinner = async (req, res) => {
  const { game, matchId, winner } = req.body;

  if (!game || !matchId || !winner) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const result = await Winner.findOneAndUpdate(
    { game, matchId },
    { winner },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(result);
};

// DELETE /api/winners/:game/:matchId → Remove a specific winner record
const deleteWinner = async (req, res) => {
  const { game, matchId } = req.params;
  const result = await Winner.findOneAndDelete({ game, matchId });
  if (!result) {
    return res.status(404).json({ message: "Winner not found" });
  }
  res.json({ message: "Winner deleted" });
};

export default {
  getAllWinners,
  getWinnersByGame,
  upsertWinner,
  deleteWinner,
};
