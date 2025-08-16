const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/productController');

// Buyer routes
router.get('/', auth, controller.getAllProductsForBuyer);
router.get('/new-arrival', auth, controller.newproduct);
router.get("/best-sellers", auth, controller.getBestSellingProducts);
router.get("/popular-brands", auth, controller.getPopularBrands);
router.get('/:id', auth, controller.getProductById);




// Seller routes
router.post('/seller', auth, controller.createProductAsSeller);
router.get('/seller/my-products', auth, controller.getSellerProducts);
router.get('/selleroneproduct/:id', auth, controller.getSellerParticularProducts);
router.put('/seller/:id', auth, controller.updateProductAsSeller);
router.delete('/seller/:id', auth, controller.deleteProductAsSeller);
// Seller requests product deletion (soft delete request)
router.patch(
  '/seller/request-delete/:id',
  auth,
  controller.requestDeleteProductAsSeller
);
router.post('/combo/create', auth, controller.createComboProduct);

// Admin routes
router.get('/admin/all', auth, controller.getAllProductsForAdmin);
router.get('/admin/allproductperseller/:sellerId', auth, controller.getProductsOfSpecificSellerForAdmin)
router.put('/admin/toggle/product/:id', auth, controller.toggleProductApprovedornOTS)
router.put('/admin/approve/:id', auth, controller.approveProduct);
router.delete('/admin/:id', auth, controller.deleteProductAsAdmin);
// Admin permanently deletes product after review
router.delete(
  '/admin/delete/:id',
  auth,
  controller.adminDeleteProductAfterReview
);
// Admin permanently deletes product after review
// Admin rejects delete request with optional reason
router.patch(
  '/admin/reject-delete/:id',
  auth,
  controller.adminRejectDeleteRequest
);

module.exports = router;