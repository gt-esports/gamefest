import participants from '../store/participants.js';
import QRCode from '../models/qrcode.js';

const gamePoints = {
  'Minecraft': { 'Ender Dragon Kill': 100, 'Participation': 20 },
  'Fortnite': { 'Battle Royale Win': 100, 'Participation': 20 },
  'Group Round Robin': {
    'Finals Winner': 200,
    'Finals Loser': 150,
    'Second Place Group': 100,
    'Third Place Group': 50,
    'Fourth Place Group': 25
  },
  'Apex Legends': {
    'Winning Team': 200,
    'Second Place': 100,
    'Third Place': 50,
    'Participation': 25
  },
};

// For production we need real database
const qrCodeDatabase = [
  new QRCode('unique_qr_123', 'Minecraft', 'Participation'),
  new QRCode('special_qr_456', 'Apex Legends', 'Winning Team'),
  new QRCode('another_qr_789', 'Group Round Robin', 'Second Place Group'),
];

export const addPoints = (req, res) => {
  const userId = req.params.userId;
  const { qrCode } = req.body;

  const user = participants[userId];
  if (!user) return res.status(404).json({ error: 'Participant not found' });

  const foundQr = qrCodeDatabase.find(qr => qr.code === qrCode);
  if (!foundQr) return res.status(400).json({ error: 'Invalid QR Code' });

   // Check for duplicate scan
   if (user.scannedQRCodes.has(qrCode)) {
    return res.status(400).json({ error: 'QR Code already scanned by this user' });
  }

  const { game, achievement } = foundQr;
  const pointsToAdd = gamePoints[game]?.[achievement];

  if (pointsToAdd === undefined) {
    return res.status(400).json({ error: 'Invalid achievement' });
  }

  user.participationPoints += pointsToAdd;
  user.scannedQRCodes.add(qrCode); // Mark as scanned

  res.json({
    message: `Added ${pointsToAdd} points to ${user.name} for ${game}: ${achievement}`,
    updatedPoints: user.participationPoints,
  });
};

export const getParticipantPoints = (req, res) => {
  const userId = req.params.userId;
  const user = participants[userId];
  if (!user) return res.status(404).json({ error: 'Participant not found' });

  res.json({
    userId: user.userId,
    name: user.name,
    participationPoints: user.participationPoints,
    teams: user.teams,
  });
};