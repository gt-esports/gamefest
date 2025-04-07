import express from 'express';
import { getParticipantPoints } from '../controllers/participantController.js';

const router = express.Router();

router.get('/:userId', getParticipantPoints);
// router.post('/add/:userId', addPoints);

export default router;
