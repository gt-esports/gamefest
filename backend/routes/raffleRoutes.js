const express = require('express');
const raffleController = require('../controllers/raffleController');

const router = express.Router();

// POST /api/raffle/pick
router.post('/pick', raffleController.pickRaffles);
router.get('/raffles', raffleController.getWinners);

module.exports = router;
