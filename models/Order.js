const mongoose = require('mongoose');

// 🔹 Each ordered item schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },

  // 💰 Earnings breakdown
  platformCommission: { type: Number }, // e.g. 10%
  sellerEarning: { type: Number },      // what seller earns after commission
  isSettled: { type: Boolean, default: false }, // marked as paid to seller

  isReturnable: { type: Boolean, default: true },
  isReturned: { type: Boolean, default: false },
  returnRequested: Boolean,
  returnStatus: String,
}, { _id: false });

// 🔹 Shipping Address Schema (copied at order time)
const shippingAddressSchema = new mongoose.Schema({
  label: { type: String },
  type: { type: String, enum: ['home', 'office', 'other'] },
  fullAddress: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },

  items: [orderItemSchema], // multiple items from possibly multiple sellers

  shippingAddress: shippingAddressSchema,


  deliveryOption: {
    type: String,
    enum: ['standard', 'express'],
    default: 'standard'
  },
  CourierPartner:{type:String},
  expectedDeliveryDate: { type: Date },
  shippingCharge: { type: Number, default: 0 },
  trackingId: { type: String }, // 🔴 NEW



  // 🔹 Payment Section
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'Card', 'NetBanking'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  // 🔹 Order Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  refundStatus: {
    type: String,
    enum: ['not_initiated', 'initiated', 'refunded'],
    default: 'not_initiated'
  },
  refundedAt: { type: Date },


  // 🔹 Order Financial Summary
  totalAmount: { type: Number, required: true },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },

  // 🔹 Timestamps
  placedAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
