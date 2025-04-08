import Staff from "../models/Staff.js";

const getAllStaff = async (req, res) => {
  const staff = await Staff.find();
  res.json(staff);
};

const getStaffByName = async (req, res) => {
  const staff = await Staff.findOne({ name: req.params.name });
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
};

const updateStaff = async (req, res) => {
  const staff = await Staff.findOneAndUpdate(
    { name: req.params.name },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
};

const createStaff = async (req, res) => {
  const staff = new Staff(req.body);
  await staff.save();
  res.status(201).json(staff);
};

const deleteStaff = async (req, res) => {
  const result = await Staff.findOneAndDelete({ name: req.params.name });
  if (!result) return res.status(404).json({ message: "Staff not found" });
  res.json({ message: "Staff deleted" });
};

export default {
  getAllStaff,
  getStaffByName,
  updateStaff,
  createStaff,
  deleteStaff,
};
