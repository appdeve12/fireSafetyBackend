const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel', // reference to Admin or Seller
    required: true,
  },
  userModel: {
    type: String,
    enum: ['Admin', 'Seller'],
    required: true,
  },
  type: {
    type: String,
    enum: ['order', 'seller-registration', 'product'],
    default: 'seller-registration',
  },
  title: String,
  message: String,
  read: {
    type: Boolean,
    default: false,
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
