const express = require('express');
const raffleController = require('../controllers/raffleController');

const router = express.Router();

// POST /api/raffle/pick
router.post('/pick', raffleController.pickRaffles);

module.exports = router;
