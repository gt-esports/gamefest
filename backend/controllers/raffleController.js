const Participants = require('../models/participants');
const mongoose = require('mongoose');

export const pickRaffles = async (req, res) => {
  try {
    const { count = 1 } = req.body;
    
    if (count < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Count must be at least 1' 
      });
    }

    const participants = await getParticipants();
    
    if (participants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No eligible participants found' 
      });
    }
    
    if (participants.length < count) {
      return res.status(400).json({ 
        success: false, 
        message: `Not enough participants. Requested ${count} winners, but only ${participants.length} participants available.` 
      });
    }

    // pick winners
    const winners = pickWinnersWithWeightedChance(participants, count);
    
    return res.status(200).json({
      success: true,
      data: {
        winners
      }
    });
  } catch (error) {
    console.error('Error picking raffle winners:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to pick raffle winners' 
    });
  }
};

const getParticipants = async () => {
  const participants = await Participants.find();

  return participants.map(participant => ({
    userId: participant._id.toString(),
    name: participant.name,
    points: participant.points || 0
  }));
};

const pickWinnersWithWeightedChance = (participants, count) => {
  const _participants = [...participants];
  const winners = [];

  if (_participants.length <= count) {
    return participants;
  }
  
  for (let i = 0; i < count; i++) {
    const totalPoints = _participants.reduce((sum, p) => sum + Math.max(1, p.points), 0);
    
    const randVal = Math.random() * totalPoints;

    let cumulativePoints = 0;
    let winnerIndex = 0;
    
    for (let j = 0; j < _participants.length; j++) {
      const points = Math.max(1, _participants[j].points);
      cumulativePoints += points;
      
      if (cumulativePoints >= randVal) {
        winnerIndex = j;
        break;
      }
    }
    
    // add winner to the list and remove from available participants
    winners.push(_participants[winnerIndex]);
    _participants.splice(winnerIndex, 1);
  }
  
  return winners;
};
