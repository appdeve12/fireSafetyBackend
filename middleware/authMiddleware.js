const jwt = require('jsonwebtoken');

const Admin = require('../models/user.admin');
const Seller = require('../models/User.Seller');
const Buyer = require('../models/user.buyer');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log(decoded)
    let user;

    if (decoded.role === 'admin') user = await Admin.findById(decoded.id);
    else if (decoded.role === 'seller') user = await Seller.findById(decoded.id);
    else if (decoded.role === 'buyer') user = await Buyer.findById(decoded.id);

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { ...decoded }; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;