const mongoose = require('mongoose');

const brandAuthorizationSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  brandName: { type: String, required: true },
  
  // Trademark details
  tmReferenceNumber: { type: String }, // Optional
  trademarkCertificate: { type: String }, // URL of uploaded certificate

  // Alternative proof
  authorizationLetter: { type: String }, // URL
  purchaseInvoice: { type: String }, // URL

  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrandAuthorization', brandAuthorizationSchema);
