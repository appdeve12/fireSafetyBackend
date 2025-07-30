const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Seller = require('../models/User.Seller');
const Buyer = require('../models/user.buyer');

// 1️⃣ Create Review (Buyer only)
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, review } = req.body;
    console.log("productId, orderId, rating, review",productId, orderId, rating, review);

    const buyerId = req.user.id;
    console.log("buyerId",buyerId)

    const order = await Order.findById(orderId);
    console.log("order",order)
    console.log( order.buyer.toString(),buyerId)
    if (!order || order.buyer.toString() !== buyerId) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    const item = order.items.find(i => i.product.toString() === productId);
    console.log("item")
    if (!item) {
      return res.status(400).json({ message: 'Product not found in order' });
    }

    const deliveredDate = new Date(order.deliveredAt); // order.deliveredAt must be set
    const now = new Date();
    const diffInMs = now - deliveredDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays > 3) {
      return res.status(400).json({ message: 'Review window (3 days) has expired' });
    }

    const newReview = await Review.create({
      product: productId,
      order: orderId,
      buyer: buyerId,
      rating,
      review
    });

    res.status(201).json({ message: 'Review submitted', review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getMyProductReviews = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Step 1: Get all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');

    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(200).json({ message: 'No products found for this seller', reviews: [] });
    }

    // Step 2: Get reviews of those products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('product', 'name') // Optional: populate product title
      .populate('buyer', 'fullName') // Optional: populate buyer info
       .populate('order', 'orderId')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error in getMyProductReviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
// 3️⃣ Seller Reply to Review
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;
    const sellerId = req.user.id;

    const review = await Review.findById(reviewId).populate('product');
    if (!review || review.product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized to reply to this review' });
    }

    review.reply = {
      message,
      repliedAt: new Date(),
      repliedBy: sellerId
    };
    await review.save();

    res.status(200).json({ message: 'Reply added', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4️⃣ Seller Report Review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const sellerId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.reports.push({
      reportedBy: sellerId,
      reportedByModel: 'Seller',
      reason
    });

    review.moderation.status = 'under_review';
    await review.save();

    res.status(200).json({ message: 'Review reported', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5️⃣ Admin Moderate Review
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, resolutionNote } = req.body;
    const adminId = req.user.id;

    if (!['published', 'under_review', 'rejected', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.moderation = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      resolutionNote
    };
    await review.save();

    res.status(200).json({ message: 'Review moderation updated', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;

    const reviews = await Review.find({
      product: productId,
      'moderation.status': 'published'
    })
      .populate('buyer', 'name') // show reviewer name
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({ error: 'Failed to fetch product reviews' });
  }
};
exports.getAllReviewsForAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'title')
      .populate('buyer', 'name email')
      .populate('moderation.reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error in getAllReviewsForAdmin:', error);
    res.status(500).json({ error: 'Failed to fetch reviews for admin' });
  }
};