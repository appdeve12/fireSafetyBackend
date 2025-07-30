const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },

  type: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home'
  },

  label: { type: String },
  fullAddress: { type: String, required: true },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },

  isDefault: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Address', addressSchema);
