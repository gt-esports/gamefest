import Player from "../models/Player.js";
import Game from "../models/Game.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Sync game team rosters based on player assignments
const syncTeamRosters = async () => {
  const games = await Game.find({});
  const players = await Player.find({});

  for (const game of games) {
    for (const team of game.teams) {
      team.players = players
        .filter((p) =>
          p.teamAssignments?.some(
            (a) => a.game === game.name && a.team === team.name
          )
        )
        .map((p) => p.name);
    }
    await game.save();
  }
};

const getAllPlayers = async (req, res) => {
  const players = await Player.find();
  res.json(players);
};

const getPlayerByName = async (req, res) => {
  const player = await Player.findOne({ name: req.params.name });
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

const updatePlayer = async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata?.role;
  const updateFields = {};

  if (role === "admin") {
    Object.assign(updateFields, req.body);
  } else if (role === "staff") {
    if ("points" in req.body) updateFields.points = req.body.points;
    if ("log" in req.body) updateFields.log = req.body.log;
    if ("teamAssignments" in req.body)
      updateFields.teamAssignments = req.body.teamAssignments;
    if ("participation" in req.body)
      updateFields.participation = req.body.participation;
  } else {
    return res
      .status(403)
      .json({ message: "Forbidden: Not authorized to update this player" });
  }

  const player = await Player.findOneAndUpdate(
    { name: req.params.name },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!player) return res.status(404).json({ message: "Player not found" });

  await syncTeamRosters();
  res.json(player);
};

const createPlayer = async (req, res) => {
  const player = new Player(req.body);
  await player.save();
  await syncTeamRosters();
  res.status(201).json(player);
};

const deletePlayer = async (req, res) => {
  const result = await Player.findOneAndDelete({ name: req.params.name });
  if (!result) return res.status(404).json({ message: "Player not found" });
  await syncTeamRosters();
  res.json({ message: "Player deleted" });
};

export default {
  getAllPlayers,
  getPlayerByName,
  updatePlayer,
  createPlayer,
  deletePlayer,
};
