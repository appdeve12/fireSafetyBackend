const express=require('express');
const router=express.Router();
const auth=require("../middleware/authMiddleware");
const nocController=require("../controllers/noccontroller")
router.post("/register",auth,nocController.registerUserForNoc)
module.exports=router;