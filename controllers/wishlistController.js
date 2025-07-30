const User = require('../models/User');

exports.toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.userId);

  if (user.wishlist.includes(productId)) {
    user.wishlist.pull(productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.json({ wishlist: user.wishlist });
};

exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.userId).populate('wishlist');
  res.json(user.wishlist);
};
