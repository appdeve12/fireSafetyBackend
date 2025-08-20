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



  purpose: {
    type: String,
    enum: ['Commercial_Building', 'Office', 'Shop', 'Other','Hotel','Hospital','School','Complex'],
    required: true
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NOC', nocSchema);
