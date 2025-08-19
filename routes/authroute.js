const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const protectAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    next();
};

// Seller register
router.post('/seller/register', authController.registerSeller);

// Buyer register
router.post('/buyer/register', authController.registerBuyer);

// Admin register (optional, protect this route in prod)
router.post('/admin/register', authController.registerAdmin);

// Login (common for all roles)
router.post('/login', authController.login);
router.put("/updateprofile", auth, authController.updateProfile)

router.put("/sellers/approve-profile-update/:id", auth, protectAdmin, authController.approveSellerProfileUpdate);
router.put("/sellers/reject-profile-update/:id", auth, protectAdmin, authController.rejectSellerProfileUpdate);
router.get('/userdata', auth, authController.fetchparticularuser)

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
module.exports = router;
