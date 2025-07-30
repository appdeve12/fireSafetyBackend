const PaymentSettlement = require('../models/PaymentSettlement');
const Order = require('../models/Order');

// 1. Admin creates manual settlement
exports.newPaymentSettlement = async (req, res) => {
  try {
    const { sellerId, orderIds, paymentMethod, transactionId, remarks } = req.body;

    if (!sellerId || !orderIds || orderIds.length === 0) {
      return res.status(400).json({ error: 'sellerId and orderIds are required' });
    }

    const orders = await Order.find({ _id: { $in: orderIds }, 'items.seller': sellerId });

    if (!orders.length) {
      return res.status(404).json({ error: 'Orders not found for the seller' });
    }

    let totalAmount = 0;
    let commissionDeducted = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId && !item.isSettled) {
          totalAmount += item.sellerEarning || 0;
          commissionDeducted += item.platformCommission || 0;
        }
      });
    });

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'No unsettled earnings found for these orders' });
    }

    const settlement = new PaymentSettlement({
      seller: sellerId,
      orders: orderIds,
      totalAmount,
      commissionDeducted,
      paymentMethod,
      transactionId,
      remarks,
      status: 'pending'
    });

    await settlement.save();

    // Mark order items as settled
    for (const order of orders) {
      let updated = false;
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId && !item.isSettled) {
          item.isSettled = true;
          updated = true;
        }
      });
      if (updated) await order.save();
    }

    res.status(201).json({ message: 'Payment settlement created', settlement });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Admin: View all settlements
exports.viewAllSettlements = async (req, res) => {
  try {
    const settlements = await PaymentSettlement.find()
      .populate('seller', 'businessName email')
      .populate('orders', 'orderId status totalAmount');
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Seller: View own settlements
exports.viewSellerSettlements = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const settlements = await PaymentSettlement.find({ seller: sellerId })
      .populate('orders', 'orderId status totalAmount');
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrdersWithEarnings = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ 'items.seller': sellerId })
      .select('orderId status deliveredAt items')
      .lean();

    const sellerOrders = orders.map(order => {
      const relevantItems = order.items.filter(item => item.seller.toString() === sellerId);
      const mappedItems = relevantItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        isSettled: item.isSettled,
        sellerEarning: item.sellerEarning || 0,
        platformCommission: item.platformCommission || 0
      }));

      return {
        orderId: order.orderId,
        status: order.status,
        deliveredAt: order.deliveredAt,
        items: mappedItems
      };
    });

    res.json(sellerOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getSellerEarningSummary = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const settlements = await PaymentSettlement.find({ seller: sellerId });

    let totalPaid = 0;
    let totalCommission = 0;
    let pendingAmount = 0;

    settlements.forEach(s => {
      if (s.status === 'completed') totalPaid += s.totalAmount;
      else pendingAmount += s.totalAmount;

      totalCommission += s.commissionDeducted;
    });

    res.json({
      totalPaid,
      pendingAmount,
      totalCommission,
      totalSettlements: settlements.length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 4. Admin: Update status after payout
exports.adminUpdateSettlementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const settlement = await PaymentSettlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    settlement.status = status;
    if (transactionId) settlement.transactionId = transactionId;

    await settlement.save();

    res.json({ message: 'Settlement status updated', settlement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
