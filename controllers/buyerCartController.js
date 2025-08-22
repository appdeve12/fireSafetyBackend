// controllers/buyerCartController.js
const Buyer = require('../models/user.buyer');
const Product = require('../models/Product');

// 🛒 Add to Cart
// controllers/buyerController.js

exports.addToCart = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    console.log("buyer",buyer)
    const { productId, variationId, quantity = 1 } = req.body;
    console.log(productId, variationId, quantity)

    // ✅ Check Product Exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
console.log(product)
    // ✅ Check for variations if they exist
    let selectedVariation = null;
    const hasVariations = product.variations && product.variations.length > 0;
    console.log("hasVariations",hasVariations)

    if (hasVariations) {
      if (!variationId) {
        return res.status(400).json({ message: 'This product requires a variation to be selected.' });
      }

      selectedVariation = product.variations.find(
        (v) => v._id.toString() === variationId.toString()
      );


      if (!selectedVariation) {
        return res.status(400).json({ message: 'Selected variation is invalid.' });
      }
    }
console.log("beforeexisting")
    // ✅ Check if already in cart
    const existingItemIndex = buyer?.cart?.findIndex((item) => {
      return (
        item.product.toString() === productId &&
        ((!hasVariations && !item.variationId) ||
          (hasVariations && item.variationId?.toString() === variationId?.toString()))
      );
    });
    console.log("existingItemIndex",existingItemIndex)

    if (existingItemIndex > -1) {
      console.log("// ✅ Increase quantity if already in cart")
      // ✅ Increase quantity if already in cart
      buyer.cart[existingItemIndex].quantity += quantity;
    } else {
      // ✅ Add new item to cart
      console.log("// ✅ Add new item to cart")
      buyer.cart.push({
        product: productId,
        variationId: hasVariations ? variationId : undefined,
        quantity
      });
      console.log("buyercart",buyer.cart)
    }

    await buyer.save();
    console.log("buyercartfinal ")
    
    res.status(200).json({ message: 'Added to cart successfully', cart: buyer.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ❤️ Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    const { productId } = req.body;

    if (!buyer.wishlist.includes(productId)) {
      buyer.wishlist.push(productId);
    }

    await buyer.save();
    res.status(200).json({ message: 'Added to wishlist', wishlist: buyer.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    const { productId, variationId, quantity = 1 } = req.body;

    const existingItemIndex = buyer.cart.findIndex((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameVariation = variationId
        ? item.variationId?.toString() === variationId.toString()
        : !item.variationId;

      return sameProduct && sameVariation;
    });

    if (existingItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Decrease quantity or remove item
    const cartItem = buyer.cart[existingItemIndex];
    if (cartItem.quantity > quantity) {
      buyer.cart[existingItemIndex].quantity -= quantity;
    } else {
      // Remove item if quantity is less than or equal to the requested reduction
      buyer.cart.splice(existingItemIndex, 1);
    }

    await buyer.save();
    res.status(200).json({ message: 'Cart updated', cart: buyer.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ❌ Completely Remove Product (with or without variation) from Cart
exports.removeItemCompletelyFromCart = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    const { productId, variationId } = req.body;

    // Filter out the item from the cart
    buyer.cart = buyer.cart.filter((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameVariation = variationId
        ? item.variationId?.toString() === variationId.toString()
        : !item.variationId;

      // Keep only items that don't match the product+variation
      return !(sameProduct && sameVariation);
    });

    await buyer.save();

    res.status(200).json({ message: 'Item completely removed from cart', cart: buyer.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    const { productId } = req.body;

    buyer.wishlist = buyer.wishlist.filter(id => id.toString() !== productId);
    await buyer.save();

    res.status(200).json({ message: 'Removed from wishlist', wishlist: buyer.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 🧾 Get All Cart Items with Product Details
exports.getCartItems = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id).populate('cart.product');

    res.status(200).json({ cart: buyer.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❤️ Get All Wishlist Items with Product Details
exports.getWishlistItems = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id).populate('wishlist');

    res.status(200).json({ wishlist: buyer.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
