const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  eventDate: { type: Date, required: true },
  venue: { type: String, required: true },
  organizer: { type: String, required: true },
  availableTicket: { type: Number, required: true },
  posterPicture: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
