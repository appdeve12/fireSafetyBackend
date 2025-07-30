// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['flat', 'percent'], required: true },
  discountValue: { type: Number, required: true }, // 10% or ₹100
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // for percent-based discounts
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 1 }, // per user
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
