const express=require("express");
const router=express.Router();
const bannerController=require("../controllers/bannercontroller")
const auth=require("../middleware/authMiddleware")
router.post("/banner",auth,bannerController.CreatrBanner);
router.get("/activebanner",auth,bannerController.ActiveBanner);
module.exports=router;