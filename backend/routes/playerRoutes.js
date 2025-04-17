import express from "express";
import playerController from "../controllers/playerController.js";
import { requireClerkAuth, requireStaffOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/", playerController.getAllPlayers);
router.get("/:name", playerController.getPlayerByName);
router.put("/:name", requireStaffOrAdmin, playerController.updatePlayer);
router.post("/", requireStaffOrAdmin, playerController.createPlayer);
router.delete("/:name", requireStaffOrAdmin, playerController.deletePlayer);

export default router;
