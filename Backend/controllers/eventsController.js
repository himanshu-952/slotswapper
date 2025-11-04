const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  const events = await Event.find({ user: req.user }).sort('startTime');
  res.json(events);
};

exports.createEvent = async (req, res) => {
  const { title, startTime, endTime } = req.body;
  const event = new Event({ title, startTime, endTime, user: req.user });
  await event.save();
  res.json(event);
};

exports.updateEvent = async (req, res) => {
  const update = req.body;
  const event = await Event.findOneAndUpdate({ _id: req.params.id, user: req.user }, update, { new: true });
  if (!event) return res.status(404).json({ msg: "Event not found" });
  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  const evt = await Event.findOneAndDelete({ _id: req.params.id, user: req.user });
  if (!evt) return res.status(404).json({ msg: "Event not found" });
  res.json({ msg: "Event deleted" });
};
