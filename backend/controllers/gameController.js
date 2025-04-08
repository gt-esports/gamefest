import Game from "../models/Game.js";

const getAllGames = async (req, res) => {
  const games = await Game.find();
  res.json(games);
};

const getGameByName = async (req, res) => {
  const game = await Game.findOne({ name: req.params.name });
  if (!game) return res.status(404).json({ message: "Game not found" });
  res.json(game);
};

const updateGame = async (req, res) => {
  const game = await Game.findOneAndUpdate(
    { name: req.params.name },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!game) return res.status(404).json({ message: "Game not found" });
  res.json(game);
};

const createGame = async (req, res) => {
  const game = new Game(req.body);
  await game.save();
  res.status(201).json(game);
};

const deleteGame = async (req, res) => {
  const result = await Game.findOneAndDelete({ name: req.params.name });
  if (!result) return res.status(404).json({ message: "Game not found" });
  res.json({ message: "Game deleted" });
};

export default {
  getAllGames,
  getGameByName,
  updateGame,
  createGame,
  deleteGame,
};
