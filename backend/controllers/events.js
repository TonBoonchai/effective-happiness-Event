const Event = require('../models/Event');
const dayjs = require('dayjs');

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res) => {
  const events = await Event.find();
  res.json({
    success: true,
    count: events.length,
    data: events
  });
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Event not found - Invalid ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create event
// @route   POST /api/v1/events
// @access  Admin
exports.createEvent = async (req, res) => {
  const { name, description, eventDate, venue, organizer, availableTicket, posterPicture } = req.body;
  if (dayjs(eventDate).isBefore(dayjs(), 'day')) {
    return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
  }
  const event = await Event.create({ name, description, eventDate, venue, organizer, availableTicket, posterPicture });
  res.status(201).json({
    success: true,
    data: event
  });
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Admin
exports.updateEvent = async (req, res) => {
  const { eventDate } = req.body;
  if (eventDate && dayjs(eventDate).isBefore(dayjs(), 'day')) {
    return res.status(400).json({ message: 'Event date cannot be in the past' });
  }
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Admin
exports.deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
};
