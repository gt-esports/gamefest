import express from "express";
import bulkController from "../controllers/bulkController.js";
import { requireClerkAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireClerkAuth);
router.post("/", requireAdmin, bulkController.bulkUpload);

export default router;
