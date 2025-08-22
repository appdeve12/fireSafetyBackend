// routes/buyerCartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/buyerCartController');
const auth = require('../middleware/authMiddleware'); // Must set req.user

router.post('/cart/add', auth, cartController.addToCart);
router.post('/wishlist/add', auth, cartController.addToWishlist);
router.post('/cart/remove-item', auth, cartController.removeItemCompletelyFromCart);
router.post('/cart/remove', auth, cartController.removeFromCart);
router.post('/wishlist/remove', auth, cartController.removeFromWishlist);
router.get('/cart', auth, cartController.getCartItems);
router.get('/wishlist', auth, cartController.getWishlistItems);


module.exports = router;
