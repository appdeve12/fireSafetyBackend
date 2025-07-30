const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({

  email: { type: String, required: true, unique: true },
  alternateemail:{type:String,unique:true},
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  businessName: { type: String, required: true },
  storeName: { type: String },
  businessAddress: { type: String },

  gstNumber: { type: String },
  gstCertificateUrl: { type: String },

  
 
  accountName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  bankName: { type: String },

  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  pendingUpdates: {
    type: Object,
    default: null,
  },
  role: { type: String, default: 'seller' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Seller', sellerSchema);
