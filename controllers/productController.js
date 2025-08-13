const Product = require('../models/Product');
const Order=require('../models/Order')

// BUYER: Get all approved products
exports.getAllProductsForBuyer = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
subcategory,

      hasDiscount,
      sortBy,
    } = req.query;

    const filter = { isApproved: true };

    // 🔍 Search by name or description (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 📂 Filter by category
    if (category) filter.category = category;
    if (subcategory) filter.subcategory=subcategory;

    // 💰 Price Range filter
    if (minPrice || maxPrice) {
      const priceRange = [];
      if (minPrice) priceRange.push({ 'variations.price': { $gte: parseFloat(minPrice) } });
      if (maxPrice) priceRange.push({ 'variations.price': { $lte: parseFloat(maxPrice) } });

      if (priceRange.length) {
        filter.$or = [
          { price: { $exists: true, $gte: parseFloat(minPrice || 0), $lte: parseFloat(maxPrice || Infinity) } },
          ...priceRange
        ];
      }
    }


    // 🏷️ Brand Filter
    if (brand) filter.brand = brand;



    // 🧾 Has Discount filter
    if (hasDiscount === 'true') {
      filter.$or = [
        { discount: { $gt: 0 } },
        { 'variations.discount': { $gt: 0 } }
      ];
    }

    // 🔀 Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'price-asc':
        sortOption.price = 1;
        break;
      case 'price-desc':
        sortOption.price = -1;
        break;
      case 'newest':
        sortOption.createdAt = -1;
        break;
      case 'popularity':
        sortOption.popularity = -1; // You need to define "popularity"
        break;

      default:
        sortOption.createdAt = -1;
    }

    const products = await Product.find(filter).sort(sortOption);
    res.status(200).json({ success: true, count: products.length, products });

  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// BUYER: Get single approved product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isApproved) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SELLER: Create a new product
exports.createProductAsSeller = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const newProduct = new Product({
      ...req.body,
      seller: req.user.id,
      isApproved: false
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// SELLER: Get own products
exports.getSellerProducts = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const products = await Product.find({ seller: req.user.id }).populate("brandAuth")
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getSellerParticularProducts = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id  // ✅ Optional: Ensures seller can only access their own product
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product); // 👈 Now sending single object instead of array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// SELLER: Update own product
exports.updateProductAsSeller = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }

    Object.assign(product, req.body);

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
    
// SELLER: Delete own product
exports.deleteProductAsSeller = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET /api/products/new
exports.newproduct = async (req, res) => {
  console.log("Fetching new arrival products...");
  try {
    const newProducts = await Product.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('subcategory category images name'); // Select only these fields

    console.log("New Products:", newProducts);
    res.json({ products: newProducts });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/brands/:brand/products
exports.brandnamebyproduct= async (req, res) => {
  try {
    const brandName = req.params.brand;
    const products = await Product.find({ brand: brandName, isApproved: true });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getBestSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // limit results, default 10

    const bestSellers = await Order.aggregate([
      { $unwind: "$items" }, // break items array
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } }, // highest sold first
      { $limit: limit },
      {
        $lookup: {
          from: "products", // collection name
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    res.json({ success: true, data: bestSellers });
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getPopularBrands = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const productLimit = parseInt(req.query.productLimit) || 5;

    const popularBrands = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      { $unwind: "$productData" },
      {
        $group: {
          _id: {
            brand: "$productData.brand",
            brandImage: "$productData.brandImage" // 🆕 include brand image
          },
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);

    // Fetch products for each brand
    for (let brand of popularBrands) {
      const products = await Product.find({ brand: brand._id.brand })
        .limit(productLimit)
        .select("name price images category brand brandImage");
      brand.products = products;
    }

    res.json({ success: true, data: popularBrands });
  } catch (error) {
    console.error("Error fetching popular brands:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: Get all products
exports.getAllProductsForAdmin = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const products = await Product.find().populate('seller', 'fullName email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getProductsOfSpecificSellerForAdmin = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const sellerId = req.params.sellerId;
    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }



    const products = await Product.find({ seller: sellerId })
      .populate('seller', 'name email')
      .populate("brandAuth")


    res.status(200).json({
      success: true,
      message: 'Products fetched successfully for this seller',
      data: products
    });

  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
// ADMIN: Approve product
exports.approveProduct = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isApproved = true;
    await product.save();
    res.json({ message: 'Product approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.toggleProductApprovedornOTS=async(req,res)=>{
  if(req.user.role !=='admin' && req.user.role !=='superadmin'){
    return res.status(403).json({message:'Unathorized'})
  }
  try{
    const product=await Product.findById(req.params.id);
    if(!product){
      return res.status(404).json({message:"Product Not FOUND"})
    }
      product.isApproved = !product.isApproved
      await product.save();
      return res.status(200).json({
        message:`product approved status updated to ${product.isApproved}`,
        product
      })
  }catch(err){
    console.log(err)
    return res.status(500).json({message:'Server error'})
  }

}

// ADMIN: Delete any product
exports.deleteProductAsAdmin = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Seller requests deletion — sets flag only
exports.requestDeleteProductAsSeller = async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }

    if (product.deleteRequested) {
      return res.status(400).json({ message: 'Delete request already submitted' });
    }

    product.deleteRequested = true;
    product.deleteRequestedAt = new Date();
    await product.save();

    res.json({ message: 'Delete request submitted for review' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.adminDeleteProductAfterReview = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.deleteRequested) {
      return res.status(400).json({ message: 'No delete request submitted for this product' });
    }

    await Product.deleteOne({ _id: product._id });

    res.json({ message: 'Product permanently deleted by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.adminRejectDeleteRequest = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.deleteRequested) {
      return res.status(404).json({ message: 'No delete request to reject' });
    }

    product.deleteRequested = false;
    product.deleteRejectedReason = req.body.reason || 'No reason provided';
    product.deleteReviewedBy = req.user.id;
    product.deleteReviewedAt = new Date();
    await product.save();

    res.json({ message: 'Delete request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
