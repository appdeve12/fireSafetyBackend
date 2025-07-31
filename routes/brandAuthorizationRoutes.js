const express = require('express');
const router = express.Router();
const brandAuthCtrl = require('../controllers/brandAuthorizationController');


const auth = require('../middleware/authMiddleware');
const protectAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
};

// Seller requests brand authorization
router.post('/request', auth, brandAuthCtrl.requestBrandAuthorization);
router.get('/all', auth, brandAuthCtrl.allBrandAuthorization);

// Admin reviews brand authorization
router.patch('/:id/review', auth, protectAdmin, brandAuthCtrl.reviewBrandAuthorization);

module.exports = router;
