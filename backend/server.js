import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./middleware/db.js";
import { requireClerkAuth } from "./middleware/auth.js";

import gameRoutes from "./routes/gameRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import bulkRoutes from "./routes/bulkRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";

// Load env variables
dotenv.config({ path: "../.env" });
connectDB();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://gamefest.gatechesports.com",
];

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you're using cookies or auth headers
  })
);

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/raffles", raffleRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
