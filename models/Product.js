const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default:"firesafety" },
  brandAuth: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandAuthorization' },

  images: [{ type: String }],

  // Pricing
  mrp: { type: Number}, // Maximum Retail Price
  price: { type: Number}, // Selling Price
  discount: { type: Number, default: 0 }, // Optional discount percentage

  stock: { type: Number },
  sku: { type: String },

  // Warranty & Policy Info
  warrantyPolicy: { type: String }, // "1 year warranty on manufacturing defects"
  safetyInformation: { type: String }, // "Keep away from heat and sunlight"
  returnPolicy: { type: String }, // "7 days return policy"
  tophighlights: { type: String },

  deleteRequested: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date },
  deleteReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  deleteReviewedAt: { type: Date },
  deleteRejectedReason: { type: String },
  subcategory: { type: String }, // optional
  subSubcategory: { type: String }, // optional

  // Fire Safety Specific
  productType: { type: String },
  usageClass: [{ type: String }],
  certification: { type: String },
  expiryDate: { type: Date },
  maintenanceInterval: { type: String },
  complianceDocuments: [{ type: String }],
  packageContents: { type: String },

  variations: [
    {
      label: { type: String, required: true },
      mrp: { type: Number, required: true },
      price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      stock: { type: Number, required: true },
      sku: { type: String, required: true }
    }
  ],
  // Combo Product Support
  isCombo: { type: Boolean, default: false },
  comboItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      variationLabel: { type: String, required: true },
      quantity: { type: Number, required: true }
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