// controllers/couponController.js
const Coupon = require('../models/Coupon');
const Buyer = require('../models/user.buyer');

// 1. Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
    try {
        const data = req.body;
        data.code = data.code.toUpperCase();

        const existing = await Coupon.findOne({ code: data.code });
        if (existing) return res.status(400).json({ message: 'Coupon already exists' });

        const coupon = await Coupon.create(data);
        res.status(201).json({ message: 'Coupon created', coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get All Coupons (Admin)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get Single Coupon (Admin)
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Coupon (Admin)
exports.updateCoupon = async (req, res) => {
    try {
        const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon updated', updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Delete Coupon (Admin)
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 6. Apply/Validate Coupon (Buyer)
exports.validateAndApplyCoupon = async (req, res) => {
    try {
        const { couponCode, buyerId, orderAmount } = req.body;

        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order ₹${coupon.minOrderAmount} required.` });
        }

        if (coupon.usedBy.includes(buyerId)) {
            return res.status(400).json({ message: 'You have already used this coupon' });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
        } else {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }

        res.json({
            message: 'Coupon applied',
            discountAmount,
            finalAmount: orderAmount - discountAmount,
            couponCode: coupon.code
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
