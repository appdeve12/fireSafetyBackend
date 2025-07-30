// // routes/orderRoutes.js
// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/PaymentSettlementcontroller');
// const auth = require('../middleware/authMiddleware');
// // middleware/authMiddleware.js
// exports.verifyAdmin = (req, res, next) => {
//   if (req.user?.role === 'admin' || req.user?.role === 'superadmin') return next();
//   return res.status(403).json({ error: 'Admin access required' });
// };

// exports.verifySeller = (req, res, next) => {
//   if (req.user?.role === 'seller') return next();
//   return res.status(403).json({ error: 'Seller access required' });
// };

// // Seller


// // Seller earning summary
// router.get('/earnings-summary/:sellerId', auth.verifySeller, paymentController.getSellerEarningSummary);

// // Seller orders with payment info
// router.get('/orders-with-earnings/:sellerId', auth.verifySeller, paymentController.getOrdersWithEarnings);
// router.get('/settlements/seller/:sellerId', verifySeller, paymentController.viewSellerSettlements);
// // Admin
// router.post('/settlements', verifyAdmin, paymentController.newPaymentSettlement);
// router.get('/settlements', verifyAdmin, paymentController.viewAllSettlements);
// router.patch('/settlements/:id/status', verifyAdmin, paymentController.adminUpdateSettlementStatus);





// module.exports = router;
