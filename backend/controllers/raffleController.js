import Players from '../models/Player.js';

const pickRaffles = async (req, res) => {
  try {
    const { count } = req.body;

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

    // reset all participants' raffle placing to 0
    await Players.updateMany(
      {},
      { $set: { raffleWinner: false, rafflePlacing: 0 } }
    );

    // pick winners
    const winners = pickWinnersWithWeightedChance(participants, 3);

    const placings = winners.map((winner, index) => {
      let place;
      switch (index) {
        case 0: place = '1st'; break;
        case 1: place = '2nd'; break;
        case 2: place = '3rd'; break;
        default: place = 'Participant';
      }
      return { ...winner, place };
    });

    for (let i = 0; i < winners.length; i++) {
      await Players.updateOne(
        { _id: winners[i].userId },
        { $set: { rafflePlacing: i + 1, raffleWinner: true } }
      );
    }
    
    return res.status(200).json({
      success: true,
      winners: placings
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

    const winnerPlacings = winners.map(winner => {
      const place = winner.rafflePlacing === 1 ? '1st' : 
                    winner.rafflePlacing === 2 ? '2nd' : 
                    winner.rafflePlacing === 3 ? '3rd' : 'Participant';
      
      return {
        userId: winner._id,
        name: winner.name,
        points: winner.points,
        place
      };
    });
    
    return res.status(200).json({
      success: true,
      data: {
        winners: winnerPlacings
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