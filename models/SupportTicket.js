const mongoose = require('mongoose');

const ticketReplySchema = new mongoose.Schema({
  senderRole: { 
    type: String, 
    enum: ['seller', 'admin'], 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderRole',  // Corrected here
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  attachments: [{ 
    type: String, 
    default: [] 
  }], // array of URLs
  repliedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const supportTicketSchema = new mongoose.Schema({
  ticketId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g. TKT20250715XYZ

  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller', 
    required: true 
  },

  subject: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  attachments: [{ 
    type: String, 
    default: [] 
  }], // initial attachments

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },

  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    default: null
  }, 

  replies: [ticketReplySchema],

}, { timestamps: true });  // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
