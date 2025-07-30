
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createReview,
  getProductReviews,
  getAllReviewsForAdmin,
  reportReview,
  moderateReview,
  replyToReview,
  getMyProductReviews
} = require('../controllers/reviewController');

// 👤 Buyer: Create review (allowed within 3 days of delivery)
router.post('/:orderId/:productId', auth, createReview);

// 👤 Seller: View reviews for their products
router.get('/seller/my-products', auth, getMyProductReviews);

// 👤 Seller/Admin: Report review
router.post('/report/:reviewId', auth, reportReview);

// 👤 Seller: Reply to review
router.post('/reply/:reviewId', auth, replyToReview);

// 👤 Admin: Moderate reported reviews
router.post('/moderate/:reviewId', auth, moderateReview);

// 👤 Public: Get all reviews of a product
router.get('/product/:productId', getProductReviews);

// 👤 Admin: View all reviews
router.get('/admin/all', auth, getAllReviewsForAdmin);

module.exports = router;
