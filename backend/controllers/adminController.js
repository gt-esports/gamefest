import participants from '../store/participants.js';
import admins from '../store/admins.js';

export const getAllParticipants = (req, res) => {
  const list = Object.values(participants).map(p => ({
    userId: p.userId,
    name: p.name,
    participationPoints: p.participationPoints,
    teams: p.teams,
  }));
  res.json(list);
};

export const modifyPoints = (req, res) => {
  const { userId } = req.params;
  const { points } = req.body;

  const user = participants[userId];
  if (!user) return res.status(404).json({ error: 'Participant not found.' });

  if (typeof points !== 'number') return res.status(400).json({ error: 'Invalid points value.' });

  user.participationPoints += points;
  res.json({ message: `Points updated`, updatedPoints: user.participationPoints });
};

export const setAdmin = (req, res) => {
  const { newAdminId } = req.body;
  if (!newAdminId) return res.status(400).json({ error: 'Admin ID required' });

  if (admins.find(a => a.adminId === newAdminId)) {
    return res.status(400).json({ error: 'Already an admin' });
  }

  admins.push({ adminId: newAdminId });
  res.json({ message: `Admin ${newAdminId} added.` });
};

export const removeAdmin = (req, res) => {
  const { adminId } = req.params;
  if (!adminId) return res.status(400).json({ error: 'Admin ID required' });

  const index = admins.findIndex(a => a.adminId === adminId);
  if (index === -1) return res.status(404).json({ error: 'Admin not found' });

  admins.splice(index, 1);
  res.json({ message: `Admin ${adminId} removed.` });
}
