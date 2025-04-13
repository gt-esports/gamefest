import express from "express";
import gameController from "../controllers/gameController.js";
import {
  requireClerkAuth,
  requireAdmin,
  requireStaffOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/", requireStaffOrAdmin, gameController.getAllGames);
router.get("/:name", requireStaffOrAdmin, gameController.getGameByName);
router.put("/:name", requireAdmin, gameController.updateGame);
router.post("/", requireAdmin, gameController.createGame);
router.delete("/:name", requireAdmin, gameController.deleteGame);

export default router;
