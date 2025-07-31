const Address = require('../models/Address');
const Buyer = require('../models/user.buyer');

exports.addAddress = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ error: 'Buyer not found' });

    // If default, unset previous
    if (req.body.isDefault) {
      await Address.updateMany({ buyer: req.user.id }, { isDefault: false });
    }

    const address = new Address({ ...req.body, buyer: req.user.id });
    const saved = await address.save();

    // Add to buyer
    await Buyer.findByIdAndUpdate(
      req.user.id,
      { $push: { addresses: saved._id } },
      { new: true, useFindAndModify: false }
    );

    res.status(201).json({ message: 'Address added', address: saved });
  } catch (err) {
    console.error('Error adding address:', err);
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
