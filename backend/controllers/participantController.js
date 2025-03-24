import Participant from '../models/participant.js';
import QRCode from '../models/qrcode.js';

// Dummy data (replace with database later)
let participants = {
  'user123': new Participant('user123', 'Alice'),
  'user456': new Participant('user456', 'Bob'),
  'user789': new Participant('user789', 'Charlie'),
};

const admins = ['admin123', 'admin456'];

const isAdmin = (req, res, next) => {
  const adminId = req.headers['admin-id'];
  if (!admins.includes(adminId)) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  next();
};

const addPoints = (req, res) => {
  const userId = req.params.userId;
  const { qrCode } = req.body; // Expecting game, achievement, or qrCode

  if (!participants[userId]) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  let pointsToAdd = 0;
  let awardedFor = '';
  let qrCodeFound = false;

  // For production we need real database
  const qrCodeDatabase = [
    new QRCode('unique_qr_123', 'Minecraft', 'Participation'),
    new QRCode('special_qr_456', 'Apex Legends', 'Winning Team'),
    new QRCode('another_qr_789', 'Group Round Robin', 'Second Place Group'),
  ];

  if (qrCode) {
    const foundQrCode = qrCodeDatabase.find(qr => qr.code === qrCode);
    if (foundQrCode) {
      qrCodeFound = true;
      const { game: qrGame, achievement: qrAchievement } = foundQrCode; // Extract game and achievement from QR code object
      switch (qrGame) {
        case 'Minecraft':
          if (qrAchievement === 'Ender Dragon Kill') {
            pointsToAdd = 100;
          } else if (qrAchievement === 'Participation') {
            pointsToAdd = 20;
          } else {
            return res.status(400).json({ error: 'Invalid Minecraft achievement from QR code' });
          }
          break;
        case 'Fortnite':
          if (qrAchievement === 'Battle Royale Win') {
            pointsToAdd = 100;
          } else if (qrAchievement === 'Participation') {
            pointsToAdd = 20;
          } else {
            return res.status(400).json({ error: 'Invalid Fortnite achievement from QR code' });
          }
          break;
        case 'Group Round Robin':
          if (qrAchievement === 'Finals Winner') {
            pointsToAdd = 200;
          } else if (qrAchievement === 'Finals Loser') {
            pointsToAdd = 150;
          } else if (qrAchievement === 'Second Place Group') {
            pointsToAdd = 100;
          } else if (qrAchievement === 'Third Place Group') {
            pointsToAdd = 50;
          } else if (qrAchievement === 'Fourth Place Group') {
            pointsToAdd = 25;
          } else {
            return res.status(400).json({ error: 'Invalid Group Round Robin achievement from QR code' });
          }
          break;
        case 'Apex Legends':
          if (qrAchievement === 'Winning Team') {
            pointsToAdd = 200;
          } else if (qrAchievement === 'Second Place') {
            pointsToAdd = 100;
          } else if (qrAchievement === 'Third Place') {
            pointsToAdd = 50;
          } else if (qrAchievement === 'Participation') {
            pointsToAdd = 25;
          } else {
            return res.status(400).json({ error: 'Invalid Apex Legends achievement from QR code' });
          }
          break;
        default:
          return res.status(400).json({ error: 'Invalid game from QR code' });
      }
      awardedFor = `scanning QR code for ${qrGame}: ${qrAchievement}`;
    }
    if (!foundQrCode) {
      return res.status(400).json({ error: 'Invalid QR Code' });
    }
  }

  participants[userId].participationPoints += pointsToAdd;

  res.json({
    message: `Added ${pointsToAdd} points to ${participants[userId].name} for ${awardedFor}.`,
    updatedPoints: participants[userId].participationPoints,
  });
};

const modifyPoints = (req, res) => {
  const userId = req.params.userId;
  const points = req.body.points;

  console.log(`modifyPoints: userId=<span class="math-inline">\{userId\}, points\=</span>{points}`); // Log input

  if (!participants[userId]) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  if (typeof points !== 'number') {
    return res.status(400).json({ error: 'Invalid points value.' });
  }

  participants[userId].participationPoints += points;

  console.log(`modifyPoints: Points updated for userId=<span class="math-inline">\{userId\}, new points\=</span>{participants[userId].participationPoints}`); // Log success

  res.json({
    message: `Updated ${points} points to ${participants[userId].name}.`,
    updatedPoints: participants[userId].participationPoints,
  });
};

const getParticipantPoints = (req, res) => {
  const userId = req.params.userId;

  if (!participants[userId]) {
    return res.status(404).json({ error: 'Participant not found' });
  }
  res.json({
    userId: userId,
    name: participants[userId].name,
    participationPoints: participants[userId].participationPoints,
  });
};

const getAllParticipants = (req, res) => {
  const participantList = Object.keys(participants).map((userId) => ({
    userId: userId,
    name: participants[userId].name,
    participationPoints: participants[userId].participationPoints,
  }));
  res.json(participantList);
};

export {
  addPoints,
  modifyPoints,
  getParticipantPoints,
  getAllParticipants,
  isAdmin,
};