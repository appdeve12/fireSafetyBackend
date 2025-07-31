const Seller = require('../models/User.Seller');

// GET all sellers (for admin to review)
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// APPROVE seller
exports.approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.isApproved = true;
    await seller.save();

    res.json({ message: 'Seller approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Blocked Seller
exports.blockSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.isBlocked = true;
    await seller.save();

    res.json({ message: 'Seller blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// BLOCK / UNBLOCK seller
exports.toggleBlockSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.isBlocked = !seller.isBlocked;
    await seller.save();

    res.json({
      message: `Seller has been ${seller.isBlocked ? 'blocked' : 'unblocked'}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
