const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/buyerAddressController');

router.post('/address/add', auth, controller.addAddress);
router.get('/address', auth, controller.getAddresses);
router.delete('/address/:id', auth, controller.deleteAddress);

module.exports = router;
