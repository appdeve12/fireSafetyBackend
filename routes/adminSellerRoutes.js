const express = require('express');
const router = express.Router();
const {
  getAllSellers,
  approveSeller,
  toggleBlockSeller,
  blockSeller
} = require('../controllers/adminSellerController');
const auth = require('../middleware/authMiddleware');
const protectAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
};

router.get('/sellers',auth,protectAdmin, getAllSellers);
router.put('/sellers/:id/approve',auth,protectAdmin, approveSeller);
router.put('/sellers/:id/block',auth,protectAdmin, blockSeller);
router.put('/sellers/:id/toggle-block',auth,protectAdmin, toggleBlockSeller);

module.exports = router;
