const Noc=require("../models/NocUsers");
const buyer=require("../models/user.buyer")
exports.registerUserForNoc=async(req,res)=>{
    try{
        console.log("user")
        const {name,mobile,state,city,size,areaUnit,purpose}=req.body;
        console.log("name,mobile,state,city,size,areaUnit,purpose",name,mobile,state,city,size,areaUnit,purpose)
        const BuyerId=req.user.id;
        console.log(BuyerId)
    
        const nocuser= new Noc({
            name,mobile,state,city,size,areaUnit,purpose,buyer:BuyerId
        })
await nocuser.save();
buyer.nocRequests.push(nocuser._id);
await buyer.save();

res.status(201).json({
    message:"user succedfully register for noc",
    nocuser
})
    }catch(error){
res.status(500).json({
    message:"internal server error"
})
    }
}