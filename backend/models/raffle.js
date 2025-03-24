const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    maxWinners: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Raffle', raffleSchema);