const Noc=require("../models/NocUsers");
const buyer=require("../models/user.buyer")
exports.registerUserForNoc = async (req, res) => {
    try {
      const { name, mobile, state, city, size, areaUnit, purpose } = req.body;
      const BuyerId = req.user.id;
  
      // Create new NOC user
      const nocuser = new Noc({
        name,
        mobile,
        state,
        city,
        size,
        areaUnit,
        purpose,
        buyer: BuyerId,
      });
  
      await nocuser.save();
  
      // Find the buyer by ID
      const buyerDoc = await buyer.findById(BuyerId);
      if (!buyerDoc) {
        return res.status(404).json({ message: "Buyer not found" });
      }
  
      // Push noc request into buyer's array
      buyerDoc.nocRequests.push(nocuser._id);
      await buyerDoc.save();
  
      res.status(201).json({
        message: "User successfully registered for NOC",
        nocuser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };