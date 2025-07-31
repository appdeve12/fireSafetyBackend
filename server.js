const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Load env variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authroute');
const buyerCartRoutes = require('./routes/buyerCartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminsellerRoutes = require('./routes/adminSellerRoutes');
const brandRoutes=require('./routes/brandAuthorizationRoutes')

app.use('/api/buyer', require('./routes/buyerAddressRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
// app.use('/api/payments,', require('./routes/paymentRoutes'));
app.use('/api/review', require('./routes/reviewRoutes'));
app.use('/api/coupan', require('./routes/couponRoutes'));
app.use('/api/support', require('./routes/supportRoute'));
app.use('/api/adminseller', adminsellerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/buyer', buyerCartRoutes);
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// ✅ Optional: Restrict to image, video, and PDF types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png, .mp4, and .pdf files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Upload endpoint (photo, video, or PDF)
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.filename });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Multi-Vendor Marketplace Backend is Running 🚀');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
