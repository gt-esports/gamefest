import express from 'express';
import { addPoints, modifyPoints, getParticipantPoints, getAllParticipants, isAdmin } from '../controllers/participantController.js';

const router = express.Router();

router.post('/:userId/points', addPoints);
router.put('/admin/:userId/points', isAdmin, modifyPoints); // Add isAdmin middleware when you implement it
router.get('/:userId/points', getParticipantPoints);
router.get('/', getAllParticipants);

export default router;