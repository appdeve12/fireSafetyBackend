const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/User.Seller');
const Buyer = require('../models/user.buyer');
const Admin = require('../models/user.admin');

// Helper: Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// SELLER REGISTRATION
exports.registerSeller = async (req, res) => {
  const {
 
    email,
    phoneNumber,
    password,
    businessName,
    storeName,
    businessAddress,
    gstNumber,
   
    accountName,
    accountNumber,
    ifscCode,
    bankName,
  } = req.body;

  try {
    // Check if email or phone already registered
    if (await Seller.findOne({ email })) return res.status(400).json({ msg: 'Email already exists' });
    if (await Seller.findOne({ phoneNumber })) return res.status(400).json({ msg: 'Phone number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
    
      email,
      phoneNumber,
      password: hashedPassword,
      businessName,
      storeName,
      businessAddress,
      gstNumber,
     
      accountName,
      accountNumber,
      ifscCode,
      bankName,
    });

    await newSeller.save();

    const token = generateToken(newSeller._id, newSeller.role);
    res.status(201).json({ token, user: { id: newSeller._id, fullName: newSeller.fullName, role: newSeller.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// BUYER REGISTRATION
exports.registerBuyer = async (req, res) => {
  const { fullName, email, phoneNumber, password, shippingAddress } = req.body;

  try {
    if (await Buyer.findOne({ email })) return res.status(400).json({ msg: 'Email already exists' });
    if (await Buyer.findOne({ phoneNumber })) return res.status(400).json({ msg: 'Phone number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBuyer = new Buyer({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      shippingAddress,
    });

    await newBuyer.save();

    const token = generateToken(newBuyer._id, newBuyer.role);
    res.status(201).json({ token, user: { id: newBuyer._id, fullName: newBuyer.fullName, role: newBuyer.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ADMIN REGISTRATION (optional, often done manually)
exports.registerAdmin = async (req, res) => {
  const { fullName, email, password, role } = req.body; // role: admin or superadmin

  try {
    if (await Admin.findOne({ email })) return res.status(400).json({ msg: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'admin',
    });

    await newAdmin.save();

    const token = generateToken(newAdmin._id, newAdmin.role);
    res.status(201).json({ token, user: { id: newAdmin._id, fullName: newAdmin.fullName, role: newAdmin.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Admin.findOne({ email });
    let role = 'admin';

    if (!user) {
      user = await Seller.findOne({ email });
      role = 'seller';
    }
    if (!user) {
      user = await Buyer.findOne({ email }).populate("addresses")
      role = 'buyer';
    }

    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // ❌ Block seller login if not approved and if 
    console.log("user.isBlocked",user.isBlocked)
        
    console.log("user.isApproved",user.isApproved)
    console.log("!user.isApproved",!user.isApproved)
    if (role === 'seller' && (!user.isApproved || user.isBlocked)) {
  return res.status(403).json({ msg: 'Account not approved or has been blocked by admin' });
}


    const token = generateToken(user._id, role);
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName || user.name, role },user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.updateProfile = async (req, res) => {
  const { id, role } = req.user; // From JWT middleware
  const updateData = req.body;

  try {
    let updatedUser;
if (role === 'seller') {
  delete updateData.email;
  delete updateData.phoneNumber;
  delete updateData.role;

  // Save updates to pendingUpdates
  updatedUser = await Seller.findByIdAndUpdate(id, {
    pendingUpdates: updateData
  }, { new: true });

  return res.json({
    msg: 'Your profile update is pending admin approval.',
    user: updatedUser
  });
}

    if (role === 'buyer') {
      delete updateData.email;
      delete updateData.phoneNumber;
      updatedUser = await Buyer.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (role === 'admin') {
      delete updateData.email;
      updatedUser = await Admin.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

    res.json({
      msg: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.approveSellerProfileUpdate = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ msg: 'No pending updates for this seller' });
    }

    // Apply pending updates
    Object.assign(seller, seller.pendingUpdates);
    seller.pendingUpdates = null;

    await seller.save();

    res.json({ msg: 'Seller profile updated and approved successfully', seller });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.rejectSellerProfileUpdate = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.pendingUpdates) {
      return res.status(404).json({ msg: 'No pending updates to reject' });
    }

    seller.pendingUpdates = null;
    await seller.save();

    res.json({ msg: 'Seller profile update request rejected' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};


const nodemailer = require('nodemailer');

const otpMap = new Map(); // Temporary in-memory OTP store (use Redis or DB in production)

// Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  let user = await Admin.findOne({ email }) || await Seller.findOne({ email }) || await Buyer.findOne({ email });

  if (!user) {
    return res.status(404).json({ msg: 'User not found with this email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  otpMap.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // Expires in 10 min

  // Send OTP email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your password or App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - OTP',
    html: `<p>Your OTP is: <b>${otp}</b></p><p>It is valid for 10 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Failed to send OTP' });
    } else {
      return res.status(200).json({ msg: 'OTP sent successfully to email' });
    }
  });
};
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const otpData = otpMap.get(email);
  if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiresAt) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }

  // Clear OTP
  otpMap.delete(email);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password in the correct model
  let user = await Admin.findOneAndUpdate({ email }, { password: hashedPassword }) ||
             await Seller.findOneAndUpdate({ email }, { password: hashedPassword }) ||
             await Buyer.findOneAndUpdate({ email }, { password: hashedPassword });

  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  return res.status(200).json({ msg: 'Password reset successfully' });
};
