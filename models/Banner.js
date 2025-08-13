// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  bannerImage: { type: String, required: true }, // can be same as product image or custom
  
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true }, // e.g., startDate + 30 days
  
  amountPaid: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);
