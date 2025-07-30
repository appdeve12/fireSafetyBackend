// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require("../middleware/authMiddleware")

// Admin APIs
router.post('/admin/create', authMiddleware, couponController.createCoupon);
router.get('/admin/all', authMiddleware, couponController.getAllCoupons);
router.get('/admin/:id', authMiddleware, couponController.getCouponById);
router.put('/admin/:id', authMiddleware, couponController.updateCoupon);
router.delete('/admin/:id', authMiddleware, couponController.deleteCoupon);

// Public API (for buyer to check before applying)
router.post('/apply', couponController.validateAndApplyCoupon);

module.exports = router;
