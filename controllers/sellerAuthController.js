const Seller = require('../models/User.Seller');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER SELLER
exports.registerSeller = async (req, res) => {
  try {
    const {
      fullName, email, phoneNumber, password,
      businessName, storeName, businessAddress,
      gstNumber, gstCertificateUrl,
      panNumber, panCardUrl,
      aadharNumber, aadharCardUrl,
      businessLicenseUrl,
      accountHolderName, accountNumber, ifscCode, bankName
    } = req.body;

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) return res.status(400).json({ message: 'Seller already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
      fullName, email, phoneNumber, password: hashedPassword,
      businessName, storeName, businessAddress,
      gstNumber, gstCertificateUrl,
      panNumber, panCardUrl,
      aadharNumber, aadharCardUrl,
      businessLicenseUrl,

      accountHolderName, accountNumber, ifscCode, bankName
    });

    await newSeller.save();
    res.status(201).json({ message: 'Seller registered successfully, pending approval.' });

  } catch (error) {
    res.status(500).json({ message: 'Error registering seller', error: error.message });
  }
};

// LOGIN SELLER
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    if (seller.isBlocked) return res.status(403).json({ message: 'Account is blocked by admin' });
    if (!seller.isApproved) return res.status(403).json({ message: 'Account not yet approved' });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, seller });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    seller.password = hashed;
    await seller.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};
