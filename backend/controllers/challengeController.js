import Challenge from "../models/Challenge.js";

const getAllChallenges = async (req, res) => {
  const challenges = await Challenge.find();
  res.json(challenges);
};

const createChallenge = async (req, res) => {
  const challenge = new Challenge(req.body);
  await challenge.save();
  res.status(201).json(challenge);
};

const updateChallenge = async (req, res) => {
  const challenge = await Challenge.findOneAndUpdate(
    { name: req.params.name },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!challenge)
    return res.status(404).json({ message: "Challenge not found" });
  res.json(challenge);
};

const deleteChallenge = async (req, res) => {
  const result = await Challenge.findOneAndDelete({ name: req.params.name });
  if (!result) return res.status(404).json({ message: "Challenge not found" });
  res.json({ message: "Challenge deleted" });
};

export default {
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
