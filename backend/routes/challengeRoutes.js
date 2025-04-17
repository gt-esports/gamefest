import express from "express";
import challengeController from "../controllers/challengeController.js";
import {
  requireClerkAuth,
  requireAdmin,
  requireStaffOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/", challengeController.getAllChallenges);
router.put("/:name", requireAdmin, challengeController.updateChallenge);
router.post("/", requireAdmin, challengeController.createChallenge);
router.delete("/:name", requireAdmin, challengeController.deleteChallenge);

export default router;
