const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  brandAuth: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandAuthorization', required: true },

  images: [{ type: String }],
  price: { type: Number }, // Optional if variation-specific prices used
  discount: { type: Number },
  stock: { type: Number },
  sku: { type: String },
deleteRequested: { type: Boolean, default: false },
deleteRequestedAt: { type: Date },
deleteReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
deleteReviewedAt: { type: Date },
deleteRejectedReason: { type: String },

  // Fire Safety Specific
  productType: { type: String },
  usageClass: [{ type: String }],
  certification: { type: String },
  expiryDate: { type: Date },
  maintenanceInterval: { type: String },
  complianceDocuments: [{ type: String }],
  packageContents: { type: String },

  // 🔁 Variations (optional override for price/weight/stock/SKU)
  variations: [
    {
      label: { type: String, required: true }, // e.g., "1.3 KG", "500 G"
      price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      stock: { type: Number, required: true },
      sku: { type: String, required: true }
    }
  ],

  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
