const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },

  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },

  label: { type: String },
  fullAddress: { type: String, required: true },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
landmark:{type:String},
  receiverName: { type: String },           // added receiverName
  receiverPhoneNumber: { type: String },    // added receiverPhoneNumber
  isDefault: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Address', addressSchema);
