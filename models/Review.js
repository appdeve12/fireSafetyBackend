const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  // ✅ Seller reply
  reply: {
    message: { type: String },
    repliedAt: { type: Date },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller'
    }
  },

  // 🚩 Seller/Admin reports
  reports: [
    {
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'reports.reportedByModel'
      },
      reportedByModel: {
        type: String,
        enum: ['Seller', 'Admin'],
        required: true
      },
      reason: {
        type: String,
        required: true
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // 🛡️ Admin moderation
  moderation: {
    status: {
      type: String,
      enum: ['published', 'under_review', 'rejected', 'removed'],
      default: 'published'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    reviewedAt: {
      type: Date
    },
    resolutionNote: {
      type: String
    }
  }

}, { timestamps: true });

// ❌ Prevent duplicate review on same order-product
reviewSchema.index({ order: 1, product: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
