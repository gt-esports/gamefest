import Players from '../models/Player.js';

const pickRaffles = async (req, res) => {
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
    const winners = pickWinnersWithWeightedChance(participants, 1);

    const winnerIds = winners.map(winner => winner.userId);
    await Players.updateMany(
      { _id: { $in: winnerIds } },
      { $set: { raffleWinner: true } }
    );
    
    return res.status(200).json({
      success: true,
      winner: winners[0]
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
  const participants = await Players.find();

  return participants
    .filter(participant => participant.points > 0)  
    .map(participant => ({
      userId: participant._id.toString(),
      name: participant.name,
      points: participant.points || 0
    }));
};

const pickWinnersWithWeightedChance = (participants, count) => {
  const pool = [...participants];
  const winners = [];

  if (pool.length <= count) {
    return participants;
  }
  
  for (let i = 0; i < count; i++) {
    const totalPoints = pool.reduce((sum, p) => sum + Math.max(1, p.points), 0);
    
    const randVal = Math.random() * totalPoints;

    let cumulativePoints = 0;
    let winnerIndex = 0;
    
    for (let j = 0; j < pool.length; j++) {
      const points = Math.max(1, pool[j].points);
      cumulativePoints += points;
      
      if (cumulativePoints >= randVal) {
        winnerIndex = j;
        break;
      }
    }
    
    winners.push(pool[winnerIndex]);
    pool.splice(winnerIndex, 1);
  }
  
  return winners;
};

const getWinners = async (req, res) => {
  try {
    const winners = await Players.find({ raffleWinner: true });
    
    if (winners.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No winners found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        winners
      }
    });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch winners' 
    });
  }
};

export default {
  pickRaffles,
  getWinners
};
