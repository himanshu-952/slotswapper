const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

// Get swappable slots (other users)
exports.getSwappableSlots = async (req, res) => {
  const slots = await Event.find({ status: 'SWAPPABLE', user: { $ne: req.user } });
  res.json(slots);
};

// Create swap request
exports.createSwapRequest = async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const mySlot = await Event.findOne({ _id: mySlotId, user: req.user, status: 'SWAPPABLE' });
  const theirSlot = await Event.findOne({ _id: theirSlotId, status: 'SWAPPABLE' });

  if (!mySlot || !theirSlot) return res.status(400).json({ msg: "Slots not swappable or do not exist" });

  mySlot.status = 'SWAP_PENDING';
  theirSlot.status = 'SWAP_PENDING';
  await mySlot.save();
  await theirSlot.save();

  const swap = new SwapRequest({
    requester: req.user,
    recipient: theirSlot.user,
    requesterSlot: mySlotId,
    recipientSlot: theirSlotId
  });
  await swap.save();
  res.json(swap);
};

// Respond to a swap request
exports.respondToSwap = async (req, res) => {
  const { accept } = req.body;
  const swap = await SwapRequest.findById(req.params.requestId);

  if (!swap) return res.status(404).json({ msg: "SwapRequest not found" });
  if (String(swap.recipient) !== req.user) return res.status(403).json({ msg: "Not authorized" });

  const mySlot = await Event.findById(swap.recipientSlot);
  const theirSlot = await Event.findById(swap.requesterSlot);
  if (!mySlot || !theirSlot) return res.status(404).json({ msg: "Slots not found" });

  if (!accept) {
    swap.status = 'REJECTED';
    mySlot.status = 'SWAPPABLE';
    theirSlot.status = 'SWAPPABLE';
    await swap.save(); await mySlot.save(); await theirSlot.save();
    return res.json({ msg: "Swap rejected" });
  }

  swap.status = 'ACCEPTED';
  // Exchange slot ownerships
  const tempUser = mySlot.user;
  mySlot.user = theirSlot.user;
  theirSlot.user = tempUser;
  mySlot.status = 'BUSY';
  theirSlot.status = 'BUSY';
  await swap.save(); await mySlot.save(); await theirSlot.save();
  res.json({ msg: "Swap accepted and slots exchanged" });
};

// Incoming/outgoing requests
exports.getSwapRequests = async (req, res) => {
  const incoming = await SwapRequest.find({ recipient: req.user }).populate('requesterSlot recipientSlot');
  const outgoing = await SwapRequest.find({ requester: req.user }).populate('requesterSlot recipientSlot');
  res.json({ incoming, outgoing });
};
