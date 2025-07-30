const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

  amount: { type: Number, required: true }, // Seller earning
  platformCommission: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'settled'],
    default: 'pending'
  },

  settledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
