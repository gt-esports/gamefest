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
import winnerRoutes from "./routes/winnerRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";

// Load environment variables and connect to MongoDB
dotenv.config({ path: "../.env" });
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://gamefest.gatechesports.com",
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply CORS for all routes and handle preflight
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());

// Protect all /api routes with Clerk auth
app.use("/api", requireClerkAuth);

// Define API routes
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/bulk-upload", bulkRoutes);
app.use("/api/winner", winnerRoutes);
app.use("/api/raffles", raffleRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
