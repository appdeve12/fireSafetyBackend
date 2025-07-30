const User = require('../models/User');

exports.getProfile = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).select('-password');
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { name, email, mobile } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.userId,
    { name, email, mobile },
    { new: true }
  ).select('-password');
  res.json(updatedUser);
};
