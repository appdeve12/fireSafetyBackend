const mongoose = require('mongoose');

const nocSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true }, // Who submitted the NOC

  name: { type: String, required: true },
  mobile: { type: String, required: true },

  state: { type: String, required: true },
  city: { type: String, required: true },

  size: { type: Number, required: true }, // Numeric size

  areaUnit: {
    type: String,
    enum: ['SQFT', 'SQMTR'],
    required: true
  },

  value: { type: Number, required: true }, // Cost or estimated value

  purpose: {
    type: String,
    enum: ['COMMERCIAL_BUILDING', 'OFFICE', 'SHOP', 'OTHER'],
    required: true
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NOC', nocSchema);
