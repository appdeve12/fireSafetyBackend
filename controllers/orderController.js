// controllers/orderController.js
const Order = require('../models/Order');
const Buyer = require('../models/user.buyer');
const Seller = require('../models/User.Seller');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Notification = require('../models/Notification'); // Optional if implemented

// 1. Place Order
exports.placeOrder = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id).populate('cart.product');
    const { addressId, deliveryOption = 'standard', paymentMethod = 'COD' } = req.body;

    const address = await Address.findOne({ _id: addressId, buyer: req.user.id });
    if (!address) return res.status(400).json({ message: 'Invalid address' });

    const validCartItems = buyer.cart.filter(item => item.product);

    if (validCartItems.length === 0) {
      return res.status(400).json({ message: 'No valid items in cart' });
    }

    const items = validCartItems.map(item => {
      const product = item.product;
      const variation = product.variations.find(
        v => v._id.toString() === item.variationId?.toString()
      );

      const isFireSafety = product.category === 'firesafety';
      const basePrice = variation ? variation.price : product.price;
      const gstAmount = isFireSafety ? +(basePrice * 0.18).toFixed(2) : 0;
      const priceWithGST = basePrice + gstAmount;

      return {
        product: item.product._id,
        seller: item.product.seller,
        quantity: item.quantity,
        priceAtPurchase: priceWithGST,
        platformCommission: 0,  // aap later calculate kar sakte hain

        isReturnable: true,
        isReturned: false,
        returnRequested: false,
        returnStatus: '',
        gstAmount // ✅ optionally include this if schema is updated
      };
    });

    const baseAmount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    const shippingCharge = deliveryOption === 'express' ? 49 : 0;
    const totalAmount = baseAmount + shippingCharge;

    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(
      expectedDeliveryDate.getDate() + (deliveryOption === 'express' ? 2 : 5)
    );
    const orderId = `ORD-${Date.now()}`;
    const order = await Order.create({
      orderId,
      buyer: req.user.id,
      items,
      shippingAddress: address.toObject(),
      deliveryOption,
      expectedDeliveryDate,
      shippingCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid'
    });

    // Remove purchased items from cart
    buyer.cart = buyer.cart.filter(item => !item.product || !item.product.price || !item.product.seller);
    await buyer.save();

    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 2. Get Buyer's All Orders
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ placedAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get One Buyer Order
exports.getSingleBuyerOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.cancelOrderByBuyer = async (req, res) => {
  try {
    const { orderId } = req.params;
    const buyerId = req.user.id;

    const order = await Order.findOne({ _id: orderId, buyer: buyerId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel a shipped or delivered order' });
    }

    order.status = 'cancelled';

    // 💰 Refund logic
    if (order.paymentMethod !== 'COD' && order.paymentStatus === 'paid') {
      // 🔁 Simulate refund
      order.refundStatus = 'refunded';
      order.refundedAt = new Date();

      // Optionally: initiate real refund via Razorpay/Stripe etc.
    }

    await order.save();

    res.status(200).json({ message: 'Order cancelled and refund processed if applicable', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackOrderByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const order = await Order.findOne({ trackingId });

    if (!order) {
      return res.status(404).json({ message: 'No order found with this tracking ID' });
    }

    res.status(200).json({
      orderId: order._id,
      trackingId: order.trackingId,
      status: order.status,
      expectedDeliveryDate: order.expectedDeliveryDate,
      shippingAddress: order.shippingAddress,
      deliveryOption: order.deliveryOption,
      placedAt: order.placedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.returnProduct = async (req, res) => {
  const { orderId, productId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.items = order.items.map(item => {
    if (
      item.product.toString() === productId &&
      item.isReturnable &&
      !item.isReturned
    ) {
      item.isReturned = true;
      item.isSettled = false;
      item.sellerEarning = 0;
    }
    return item;
  });

  await order.save();
  res.status(200).json({ message: 'Product marked as returned', order });
};
exports.requestReturn = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const item = order.items.find(i => i.product.toString() === productId);

    if (!item || !item.isReturnable) {
      return res.status(400).json({ message: 'Item not returnable or not found' });
    }

    if (item.returnRequested) {
      return res.status(400).json({ message: 'Return already requested' });
    }

    item.returnRequested = true;
    item.returnStatus = 'requested';

    await order.save();

    res.status(200).json({ message: 'Return request submitted', item });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Seller's Orders
exports.getSellerOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      buyerId,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    console.log(status)
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (buyerId) filter.buyer = buyerId;

    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) filter.placedAt.$gte = new Date(startDate);
      if (endDate) filter.placedAt.$lte = new Date(endDate);
    }

    // 🔍 Find orders where any item belongs to the logged-in seller
    const orders = await Order.find({
      ...filter,
      items: { $elemMatch: { seller: req.user.id } }
    })
      .populate("buyer", "fullName  ")
      .populate("items.product")
      .lean();

    // ✂️ Return only the items that belong to this seller
    const sellerOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => item.seller.toString() === req.user.id.toString())
    }));

    res.json({ orders: sellerOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 5. Single Seller Order
exports.getSingleSellerOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("buyer", "fullName  ")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Filter only items of this seller
    const sellerItems = order.items.filter(
      item => item.seller.toString() === req.user.id
    );

    if (!sellerItems.length) {
      return res.status(403).json({ message: 'You do not have items in this order' });
    }

    res.json({
      orderId: order._id,
      buyer: order.buyer,
      shippingAddress: order.shippingAddress,
      deliveryOption: order.deliveryOption,
      trackingId: order.trackingId,
      status: order.status,
      items: sellerItems
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Seller Updates Order Status (like shipped/delivered)
exports.updateOrderStatusAsSeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryOption, CourierPartner, trackingId } = req.body;

    console.log("Received update:", status, deliveryOption, CourierPartner, trackingId);

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if seller is part of this order
    const sellerHasItems = order.items.some(item => item.seller.toString() === req.user.id);
    if (!sellerHasItems) {
      return res.status(403).json({ message: 'No items found for this seller in the order' });
    }

    // ✅ Update overall order-level status
    if (status) order.status = status;

    // ✅ Update deliveryOption and expectedDeliveryDate
    if (deliveryOption) {
      order.deliveryOption = deliveryOption;
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + (deliveryOption === 'express' ? 2 : 5));
      order.expectedDeliveryDate = expectedDelivery;
    }

    // ✅ Update trackingId and courier partner
    if (trackingId) order.trackingId = trackingId;
    if (CourierPartner) order.CourierPartner = CourierPartner;

    console.log("Updated order before save:", order);

    await order.save();

    res.json({ message: 'Order updated successfully', order });

  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: err.message });
  }
};

// 7. Admin Gets All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      buyerId,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (buyerId) filter.buyer = buyerId;

    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) filter.placedAt.$gte = new Date(startDate);
      if (endDate) filter.placedAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'name email') // You can add more buyer fields if needed
      .sort({ placedAt: -1 });

    res.status(200).json({ total: orders.length, orders });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Admin Get One Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name brand category')
      .populate('items.seller', 'shopName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 9. Admin Updates Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ message: 'Payment status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. Admin Updates Order Status
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(orderId,status)

const order = await Order.findOne({ orderId: orderId });

    console.log(order)
    order.status = status;
    console.log(order.status)
    await order.save();

    res.json({ message: 'Order status updated by admin', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 11. Notifications for Admin (dummy for now)
exports.getAdminNotifications = async (req, res) => {
  try {
    // Replace with Notification.find({ type: 'order' })
    res.json({ notifications: ['New order placed'] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 12. Notifications for Seller (dummy for now)
exports.getSellerNotifications = async (req, res) => {
  try {
    res.json({ notifications: ['Buyer placed an order for your product'] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/orderController.js


// controllers/orderController.js

exports.cancelOrderByBuyer = async (req, res) => {
  try {
    const { orderId } = req.params;
    const buyerId = req.user.id;

    const order = await Order.findOne({ _id: orderId, buyer: buyerId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel a shipped or delivered order' });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/orderController.js

exports.markOrderAsDelivered = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order already marked as delivered' });
    }

    // Step 1: Mark delivered & calculate platformCommission + sellerEarning
    order.items = order.items.map(item => {
      const total = item.priceAtPurchase * item.quantity;
      const commission = total * 0.10;
      const sellerEarning = total - commission;

      return {
        ...item.toObject(),
        platformCommission: commission,
        sellerEarning: sellerEarning,
        isSettled: false,
        isReturnable: true,
        isReturned: false,
      };
    });

    order.status = 'delivered';
    order.deliveredAt = new Date();

    await order.save();

    // Step 2: Start 5-day timer to settle earnings if not returned
    setTimeout(async () => {
      const freshOrder = await Order.findById(order._id);
      if (!freshOrder) return;

      freshOrder.items = freshOrder.items.map(item => {
        if (!item.isReturned && !item.isSettled) {
          item.isSettled = true;
          item.isReturnable = false;
        }
        return item;
      });

      await freshOrder.save();
      console.log(`✅ Seller earnings settled for order ${order._id} after return window`);

    }, 5 * 24 * 60 * 60 * 1000); // 5 days in ms

    res.status(200).json({
      message: 'Order marked as delivered. Seller earnings will be settled after 5 days.',
      order
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/orderController.js

exports.settleSellerPayment = async (req, res) => {
  try {
    const { orderId, sellerId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order is not delivered yet' });
    }

    let updated = false;

    order.items = order.items.map(item => {
      if (
        item.seller.toString() === sellerId &&
        item.isSettled === false &&
        item.sellerEarning > 0
      ) {
        updated = true;
        return { ...item.toObject(), isSettled: true };
      }
      return item;
    });

    if (!updated) {
      return res.status(400).json({ message: 'No unsettled items found for this seller in this order' });
    }

    await order.save();

    res.status(200).json({ message: 'Seller payment settled successfully', order });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markReturnReceived = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const item = order.items.find(i => i.product.toString() === productId);

    if (!item || item.returnStatus !== 'requested') {
      return res.status(400).json({ message: 'No return request found for this item' });
    }

    item.returnStatus = 'received';
    item.isReturned = true;
    item.isSettled = true; // Stop seller earning
    item.sellerEarning = 0;

    await order.save();

    res.status(200).json({ message: 'Return marked as received and settled', item });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
