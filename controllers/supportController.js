const SupportTicket = require('../models/SupportTicket');
const Seller = require('../models/User.Seller');
const { v4: uuidv4 } = require('uuid');

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, attachments, priority } = req.body;
    const sellerId = req.user.id;

    const ticketId = `TKT${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const ticket = await SupportTicket.create({
      ticketId,
      seller: sellerId,
      subject,
      description,
      attachments,
      priority
    });

    res.status(201).json({ message: 'Support ticket created', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      seller: req.user.id
    })
      .populate('assignedTo', 'fullName email')
      .populate('replies.senderId', 'fullName email');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { message, attachments = [] } = req.body;

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      seller: req.user.id
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.replies.push({
      senderRole: 'seller',
      senderId: req.user.id,
      message,
      attachments
    });

    // Optionally reopen the ticket if it's resolved or closed
    if (['resolved', 'closed'].includes(ticket.status)) {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    return res.json({ message: 'Reply sent', ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      seller: req.user.id
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({ message: 'Feedback can only be given after resolution' });
    }

    if (ticket.feedback && ticket.feedback.rating) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    ticket.feedback = {
      rating,
      comment,
      givenAt: new Date()
    };

    await ticket.save();

    return res.status(200).json({ message: 'Feedback submitted', ticket });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate('seller assignedTo')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getTicketByIdAdmin = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId })
      .populate('seller assignedTo');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.assignTicketToAdmin = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.assignedTo = req.params.adminId;
    await ticket.save();

    res.json({ message: 'Ticket assigned', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.replyToTicketAdmin = async (req, res) => {
  try {
    const { message, attachments } = req.body;

    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.replies.push({
      senderRole: 'admin',
      senderId: req.user.id,
      message,
      attachments
    });

    await ticket.save();
    res.json({ message: 'Reply sent', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status;
    await ticket.save();

    res.json({ message: 'Status updated', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getFeedback = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!ticket.feedback || !ticket.feedback.rating) {
      return res.status(404).json({ message: 'No feedback available' });
    }

    res.json(ticket.feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};














