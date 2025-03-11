import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

// Dummy data for participants (replace with a database later)
let participants = {
  'user123': { name: 'Alice', participationPoints: 0, visitedBooths: [] },
  'user456': { name: 'Bob', participationPoints: 0, visitedBooths: [] },
  'user789': { name: 'Charlie', participationPoints: 0, visitedBooths: [] },
};

const booths = [
    { id: 'booth1', name: 'Booth 1', points: 10 },
    { id: 'booth2', name: 'Booth 2', points: 20 },
    { id: 'booth3', name: 'Booth 3', points: 30 },
    { id: 'booth4', name: 'Booth 4', points: 40 },
    { id: 'booth5', name: 'Booth 5', points: 50 },
]

const admins = ['admin123', 'admin456'];

// Check if the user is an admin
const isAdmin = (req, res, next) => {
    const adminId = req.headers['admin-id'];
    if (!admins.includes(adminId)) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
}

// Endpoint to add participation points
app.post('/participants/:userId/points', (req, res) => {
  const userId = req.params.userId;
  const boothId = req.body.boothId;
  const qrCode = req.body.qrCode;

  if (!participants[userId]) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  if (!qrCode) {
    return res.status(400).json({ error: 'Invalid QR Code' });
  }

  const booth = booths.find(booth => booth.id === boothId);
  if (!booth) {
    return res.status(404).json({ error: 'Booth not found' });
  }

  if (participants[userId].visitedBooths.includes(boothId)) {
    return res.status(400).json({ error: 'Participant has already visited this booth' });
  }

  participants[userId].participationPoints += booth.points;
  participants[userId].visitedBooths.push(boothId);
  
  res.json({ message: `Added ${booth.points} points to ${participants[userId].name}.`, updatedPoints: participants[userId].participationPoints });
});

// Admin endpoint to manually modify points
app.put('/admin/participants/:userId/points', isAdmin, (req, res) => {
    const userId = req.params.userId;
    const points = req.body.points;

    if (!participants[userId]) {
        return res.status(404).json({ error: 'Participant not found' });
    }

    if (typeof points !== 'number') {
        return res.status(400).json({ error: 'Invalid points value.' });
    }

    participants[userId].participationPoints += points;
    res.json({ message: `Updated ${points} points to ${participants[userId].name}.`, updatedPoints: participants[userId].participationPoints });
  }
);

// Endpoint to get participant's points
app.get('/participants/:userId/points', (req, res) => {
    const userId = req.params.userId;

    if(!participants[userId]){
        return res.status(404).json({error: "Participant not found"});
    }
    res.json({userId: userId, name: participants[userId].name, participationPoints: participants[userId].participationPoints});
});

// Endpoint to get all participants
app.get('/participants', (req, res) => {
    const participantList = Object.keys(participants).map(userId => ({
        userId: userId,
        name: participants[userId].name,
        participationPoints: participants[userId].participationPoints
    }));
    res.json(participantList);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});