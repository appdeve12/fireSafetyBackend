const Address = require('../models/Address');

// 📥 Create Address
exports.createAddress = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const {
      type, label, fullAddress,
      pincode, city, state, country,
      isDefault,landmark,receiverPhoneNumber,receiverName
    } = req.body;

    // 🧠 If isDefault is true, set all other addresses to false
    if (isDefault) {
      await Address.updateMany({ buyer: buyerId }, { isDefault: false });
    }

    const newAddress = new Address({
      buyer: buyerId,
      type,
      label,
      fullAddress,
      pincode,
      city,
      state,
      country,
      isDefault,
      landmark,receiverPhoneNumber,receiverName
    });

    await newAddress.save();
    res.status(201).json({ message: 'Address added successfully', address: newAddress });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📃 Get All Addresses for Buyer
exports.getBuyerAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ buyer: req.user.id });
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 📝 Update Address
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const buyerId = req.user.id;

    const address = await Address.findOne({ _id: addressId, buyer: buyerId });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // If making this address default, reset all others
    if (req.body.isDefault) {
      await Address.updateMany({ buyer: buyerId }, { isDefault: false });
    }

    Object.assign(address, req.body); // merge update fields
    await address.save();

    res.status(200).json({ message: 'Address updated', address });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ❌ Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const buyerId = req.user.id;

    const deleted = await Address.findOneAndDelete({ _id: addressId, buyer: buyerId });
    if (!deleted) return res.status(404).json({ message: 'Address not found' });

    res.status(200).json({ message: 'Address deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
