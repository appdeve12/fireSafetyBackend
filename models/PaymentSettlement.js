const mongoose = require('mongoose');

const paymentSettlementSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  totalAmount: { type: Number, required: true }, // total seller earning (after commission)
  commissionDeducted: { type: Number, required: true },
  payoutDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Bank Transfer', 'Wallet', 'UPI'], default: 'Bank Transfer' },
  transactionId: { type: String }, // Payment gateway transaction ID if any
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  remarks: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentSettlement', paymentSettlementSchema);
