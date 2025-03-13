import Participant from '../models/participant.js';
import Booth from '../models/booth.js';

// Dummy data (replace with database later)
let participants = {
  'user123': new Participant('user123', 'Alice'),
  'user456': new Participant('user456', 'Bob'),
  'user789': new Participant('user789', 'Charlie'),
};

const booths = [
  new Booth('booth1', 'Booth 1', 10),
  new Booth('booth2', 'Booth 2', 20),
  new Booth('booth3', 'Booth 3', 30),
  new Booth('booth4', 'Booth 4', 40),
  new Booth('booth5', 'Booth 5', 50),
];

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
  const boothId = req.body.boothId;
  // const qrCode = req.body.qrCode; // Uncomment this line if you want to use QR code

  if (!participants[userId]) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  // if (!qrCode) {
  //   return res.status(400).json({ error: 'Invalid QR Code' }); // Uncomment this block if you want to use QR code
  // }

  const booth = booths.find((b) => b.id === boothId);
  if (!booth) {
    return res.status(404).json({ error: 'Booth not found' });
  }

  if (participants[userId].visitedBooths.includes(boothId)) {
    return res.status(400).json({ error: 'Participant has already visited this booth' });
  }

  participants[userId].participationPoints += booth.points;
  participants[userId].visitedBooths.push(boothId);

  res.json({
    message: `Added ${booth.points} points to ${participants[userId].name}.`,
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