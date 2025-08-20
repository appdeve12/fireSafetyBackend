const Noc=require("../models/NocUsers");
exports.registerUserForNoc=async(req,res)=>{
    try{
        console.log("user")
        const {name,mobile,state,city,size,areaUnit,value,purpose}=req.body;
        console.log("name,mobile,state,city,size,areaUnit,value,purpose",name,mobile,state,city,size,areaUnit,value,purpose)
        const BuyerId=req.user.id;
        console.log(BuyerId)
        const checkalredyregister=await Noc.findOne({buyer:BuyerId});
        console.log("checkalredyregister",checkalredyregister)
        if(checkalredyregister){
            return res.status(400).json({
                message:'already resgister for noc'
            })
        }
        const nocuser= new Noc({
            name,mobile,state,city,size,areaUnit,value,purpose,buyer:BuyerId
        })
await nocuser.save();
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