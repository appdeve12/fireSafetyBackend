const Address = require('../models/Address');
const Buyer = require('../models/user.buyer');

// 📌 Add Address
exports.addAddress = async (req, res) => {
  try {
    const address = new Address({ ...req.body, buyer: req.user.id });

    // If marked default, unset others
    if (req.body.isDefault) {
      await Address.updateMany({ buyer: req.user.id }, { isDefault: false });
    }

    const saved = await address.save();

    // Optionally link to buyer
    await Buyer.findByIdAndUpdate(req.user.id, { $push: { addresses: saved._id } });

    res.status(201).json({ message: 'Address added', address: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get All Addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ buyer: req.user.id });
    res.status(200).json({ addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      buyer: req.user.id
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await Buyer.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: req.params.id }
    });

    res.status(200).json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
