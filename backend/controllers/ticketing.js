const Ticketing = require('../models/Ticketing');
const Event = require('../models/Event');

// Helper: Check if user has already requested 5 tickets for an event
async function userTicketCount(userId, eventId) {
  const ticketings = await Ticketing.find({ user: userId, event: eventId });
  return ticketings.reduce((sum, t) => sum + t.ticketAmount, 0);
}

// Member: Create ticketing request
exports.createTicketing = async (req, res) => {
  const { event, ticketAmount } = req.body;
  const eventObj = await Event.findById(event);
  if (!eventObj) return res.status(404).json({ message: 'Event not found' });
  const currentCount = await userTicketCount(req.user.id, event);
  if (currentCount + ticketAmount > 5) {
    return res.status(400).json({ message: 'Cannot request more than 5 tickets per event' });
  }
  if (ticketAmount > eventObj.availableTicket) {
    return res.status(400).json({ message: 'Not enough tickets available' });
  }
  const ticketing = await Ticketing.create({ user: req.user.id, event, ticketAmount });
  eventObj.availableTicket -= ticketAmount;
  await eventObj.save();
  res.status(201).json(ticketing);
};

// Get ticketing requests (admin: all requests, member: own requests)
exports.getTicketings = async (req, res) => {
  try {
    let query = req.user.role === 'admin' ? {} : { user: req.user.id };
    let populate = req.user.role === 'admin' ? ['user', 'event'] : ['event'];
    
    const ticketings = await Ticketing.find(query)
      .populate(populate)
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: ticketings.length,
      data: ticketings.map(ticket => ({
        ...ticket.toObject(),
        event: {
          _id: ticket.event._id,
          name: ticket.event.name,
          description: ticket.event.description,
          eventDate: ticket.event.eventDate,
          venue: ticket.event.venue,
          availableTicket: ticket.event.availableTicket
        }
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single ticketing request by ID (admin: any request, member: own request only)
exports.getTicketing = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    let populate = req.user.role === 'admin' ? ['user', 'event'] : ['event'];
    
    const ticketing = await Ticketing.findOne(query).populate(populate);

    if (!ticketing) {
      return res.status(404).json({
        success: false,
        message: 'Ticketing request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...ticketing.toObject(),
        event: {
          _id: ticketing.event._id,
          name: ticketing.event.name,
          description: ticketing.event.description,
          eventDate: ticketing.event.eventDate,
          venue: ticketing.event.venue,
          availableTicket: ticketing.event.availableTicket
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update ticketing request (admin: any request, member: own request)
exports.updateTicketing = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const ticketing = await Ticketing.findOne(query);
    if (!ticketing) {
      return res.status(404).json({
        success: false,
        message: 'Ticketing request not found'
      });
    }

    const eventObj = await Event.findById(ticketing.event);
    // Restore previous tickets
    eventObj.availableTicket += ticketing.ticketAmount;
    
    // Check new ticket amount
    const { ticketAmount } = req.body;

    // Check ticket limit for members
    if (req.user.role !== 'admin') {
      const currentCount = await userTicketCount(req.user.id, ticketing.event);
      if (currentCount - ticketing.ticketAmount + ticketAmount > 5) {
        return res.status(400).json({
          success: false,
          message: 'Cannot request more than 5 tickets per event'
        });
      }
    }

    if (ticketAmount > eventObj.availableTicket) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available'
      });
    }

    ticketing.ticketAmount = ticketAmount;
    await ticketing.save();
    
    eventObj.availableTicket -= ticketAmount;
    await eventObj.save();

    res.json({
      success: true,
      data: ticketing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete ticketing request (admin: any request, member: own request)
exports.deleteTicketing = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const ticketing = await Ticketing.findOne(query);
    if (!ticketing) {
      return res.status(404).json({
        success: false,
        message: 'Ticketing request not found'
      });
    }

    const eventObj = await Event.findById(ticketing.event);
    eventObj.availableTicket += ticketing.ticketAmount;
    await eventObj.save();

    await Ticketing.deleteOne({ _id: ticketing._id });

    res.json({
      success: true,
      message: 'Ticketing request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
