import express from "express";
import raffleController from "../controllers/raffleController.js";
import { requireClerkAuth, requireStaffOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);

router.post("/pick", requireStaffOrAdmin, raffleController.pickRaffles);
router.get("/getWinner", raffleController.getWinners);

export default router;
