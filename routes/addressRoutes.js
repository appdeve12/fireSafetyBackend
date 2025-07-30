const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const auth = require('../middleware/authMiddleware'); // adds req.user

router.post('/', auth, addressController.createAddress);
router.get('/', auth, addressController.getBuyerAddresses);
router.put('/:id', auth, addressController.updateAddress);
router.delete('/:id', auth, addressController.deleteAddress);

module.exports = router;
