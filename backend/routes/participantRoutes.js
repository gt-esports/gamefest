import express from 'express';
import { getParticipantPoints, addPoints } from '../controllers/participantController.js';

const router = express.Router();

router.get('/:userId', getParticipantPoints);
router.post('/add/:userId', addPoints);

export default router;
