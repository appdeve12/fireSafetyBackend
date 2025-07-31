const BrandAuthorization = require('../models/BrandAuthorizationSchema');

// Seller requests brand authorization
exports.requestBrandAuthorization = async (req, res) => {
    console.log("req.user._id",req.user.id)
  try {
    const { brandName, tmReferenceNumber, trademarkCertificate, authorizationLetter, purchaseInvoice } = req.body;
    console.log(" brandName, tmReferenceNumber, trademarkCertificate, authorizationLetter, purchaseInvoice ", brandName, tmReferenceNumber, trademarkCertificate, authorizationLetter, purchaseInvoice )

    // Check if brand request already exists
    const existing = await BrandAuthorization.findOne({ seller: req.user._id, brandName });
    if (existing) {
      return res.status(400).json({ message: "Brand request already exists for this seller" });
    }

    const request = await BrandAuthorization.create({
      seller: req.user.id,
      brandName,
      tmReferenceNumber,
      trademarkCertificate,
      authorizationLetter,
      purchaseInvoice
    });

    res.status(201).json({ message: "Brand authorization request submitted", data: request });
  } catch (error) {
    res.status(500).json({ message: "Error requesting brand authorization", error: error.message });
  }
};
exports.allBrandAuthorization = async (req, res) => {
  console.log("req.user.id", req.user.id);
  try {
    const allbrandperseller = await BrandAuthorization.find({ seller: req.user.id });

    res.status(200).json({
      message: "All brand requests for the seller fetched successfully",
      allbrandperseller,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error requesting brand authorization",
      error: error.message,
    });
  }
};


// Admin approves/rejects brand
exports.reviewBrandAuthorization = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const brandAuth = await BrandAuthorization.findById(req.params.id);
    if (!brandAuth) return res.status(404).json({ message: "Brand request not found" });

    brandAuth.status = status;
    brandAuth.verifiedBy = req.user.id;
    brandAuth.verifiedAt = new Date();
    brandAuth.rejectionReason = status === 'rejected' ? rejectionReason : null;
    await brandAuth.save();

    res.status(200).json({ message: `Brand ${status}`, data: brandAuth });
  } catch (error) {
    res.status(500).json({ message: "Error reviewing brand authorization", error: error.message });
  }
};
