// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

// Buyer
router.post('/place', auth, orderController.placeOrder);
router.get('/buyer', auth, orderController.getBuyerOrders);
router.get('/buyer/:id', auth, orderController.getSingleBuyerOrder);
router.get('/track/:trackingId', orderController.trackOrderByTrackingId);
router.patch('/buyer/cancel/:orderId', auth, orderController.cancelOrderByBuyer);
// Seller
router.get('/seller', auth, orderController.getSellerOrders);
router.get('/seller/:id', auth, orderController.getSingleSellerOrder);
router.patch('/seller/status/:orderId', auth, orderController.updateOrderStatusAsSeller);

// Admin
router.get('/admin', auth, orderController.getAllOrders);
router.get('/admin/:id', auth, orderController.getOrderById);
router.patch('/admin/payment/:orderId', auth, orderController.updatePaymentStatus);
router.patch('/admin/status/:orderId', auth, orderController.adminUpdateOrderStatus);

// Notifications
router.get('/notifications/admin', auth, orderController.getAdminNotifications);
router.get('/notifications/seller', auth, orderController.getSellerNotifications);

//marked deliverd

router.put('/:id/mark-delivered', auth, orderController.markOrderAsDelivered);
router.put('/:orderId/settle/:sellerId', auth, orderController.settleSellerPayment);

module.exports = router;
