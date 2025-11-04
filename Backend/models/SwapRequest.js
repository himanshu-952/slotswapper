const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  recipientSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
