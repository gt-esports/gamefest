import express from 'express';
import { getAllParticipants, modifyPoints, setAdmin } from '../controllers/adminController.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(isAdmin); // Apply admin middleware

router.get('/participants', getAllParticipants);
router.post('/modify/:userId', modifyPoints);
router.post('/set-admin', setAdmin);
router.delete('/remove-admin/:adminId', (req, res) => {
  const { adminId } = req.params;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required' });

  const index = admins.findIndex(a => a.adminId === adminId);
  if (index === -1) return res.status(404).json({ error: 'Admin not found' });

  admins.splice(index, 1);
  res.json({ message: `Admin ${adminId} removed.` });
});

export default router;
