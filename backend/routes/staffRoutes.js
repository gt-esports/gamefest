import express from "express";
import staffController from "../controllers/staffController.js";
import {
  requireClerkAuth,
  requireAdmin,
  requireStaffOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/", requireStaffOrAdmin, staffController.getAllStaff);
router.get("/:name", requireStaffOrAdmin, staffController.getStaffByName);
router.put("/:name", requireAdmin, staffController.updateStaff);
router.post("/", requireAdmin, staffController.createStaff);
router.delete("/:name", requireAdmin, staffController.deleteStaff);

export default router;
