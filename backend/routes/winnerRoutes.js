import express from "express";
import winnerController from "../controllers/winnerController.js";
import {
  requireClerkAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require auth
router.use(requireClerkAuth);

// GET all winners
router.get("/", winnerController.getAllWinners);

// GET all winners for a specific game
router.get("/:game", winnerController.getWinnersByGame);

// POST (create or update a winner) – admin only
router.post("/", requireAdmin, winnerController.upsertWinner);

// DELETE a winner – admin only
router.delete("/:game/:matchId", requireAdmin, winnerController.deleteWinner);

export default router;

