const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  brandAuth: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandAuthorization', required: true },

  images: [{ type: String }],

  // Pricing
  mrp: { type: Number, required: true }, // Maximum Retail Price
  price: { type: Number, required: true }, // Selling Price
  discount: { type: Number, default: 0 }, // Optional discount percentage

  stock: { type: Number },
  sku: { type: String },

  // Warranty & Policy Info
  warrantyPolicy: { type: String }, // "1 year warranty on manufacturing defects"
  safetyInformation: { type: String }, // "Keep away from heat and sunlight"
  returnPolicy: { type: String }, // "7 days return policy"

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

  // what do you understand by Nodejs
  // why nodejs is run time environment
  // what are the maine features of nodejs
  // why is noodejs is popular
  // what do ypou understand by event driven arctiture
  // what do you understand by asynronous and non blocing 
  // // why npodejs is singlethreede if it is single threde hpow ti handle multiple request
  // wxplain event loop
  //event loop phases
  //modules in nodejs 
  //explin deeply all import modules in nodesj file sysytem,path,etc..
  //what do you understand by comon js and es module 
  //hpw tp debug ypur nodejs application
  // how to performaction optimisaipn of nodejs 
  //diferrnece between pooces.nexttick,setimmate
  //what do you understand by clustring,buffer
  // what do you understand by strems in nodejs
  //what do you understna by ungauht exceptin in nodejs


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