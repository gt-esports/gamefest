import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./middleware/db.js";
import dotenv from "dotenv";
import { requireClerkAuth } from "./middleware/auth.js";
import gameRoutes from "./routes/gameRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import bulkRoutes from "./routes/bulkRoutes.js";

// mongo connection + env setup
dotenv.config({ path: "../.env" });
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// middleware
app.use(cors());
app.use(bodyParser.json());

// auth protection
app.use("/api", requireClerkAuth);

// Main API routes
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/bulk-upload", bulkRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
