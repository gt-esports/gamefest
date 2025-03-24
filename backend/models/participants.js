const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    points: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);