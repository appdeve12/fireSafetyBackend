// Create banner request (after payment)
const Banner=require("../models/Banner")
exports.CreatrBanner=async (req, res) => {
  try {
    const { productId, bannerImage, amountPaid, durationDays } = req.body;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const newBanner = new Banner({
      seller: req.user.id,
      product: productId,
      bannerImage,
      amountPaid,
      startDate,
      endDate,
      paymentStatus: 'paid',
      isActive: true
    });

    await newBanner.save();
    res.status(201).json({ message: 'Banner created successfully', banner: newBanner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.ActiveBanner= async (req, res) => {
  try {
    const banners = await Banner.find({
      isActive: true,
      endDate: { $gte: new Date() }
    })
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const cron = require('node-cron');


cron.schedule('0 0 * * *', async () => {
  await Banner.updateMany(
    { endDate: { $lt: new Date() }, isActive: true },
    { isActive: false }
  );
});
