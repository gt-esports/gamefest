import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
