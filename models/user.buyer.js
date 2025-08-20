// models/Buyer.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      variationId: {
      type: mongoose.Schema.Types.ObjectId,

    },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const buyerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },

// Buyer just holds references to addresses
addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],


  role: { type: String, default: 'buyer' },
  createdAt: { type: Date, default: Date.now },

  // 🛒 Cart & Wishlist
  cart: [cartItemSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    nocRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Noc' }]
});

module.exports = mongoose.model('Buyer', buyerSchema);
