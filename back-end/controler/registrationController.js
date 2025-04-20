const User=require('../models/People')
const bcrypt=require('bcrypt')
async function newRegisteruser(req,res,next)
{

    
    let newUser;
    let hashedPassword= await bcrypt.hash(req.body.password,10);
    // console.log(req.file.filename)
    if(req.file)
    {
        newUser=User({
            ...req.body,
            password:hashedPassword,
            avater:req.file.filename
        })
    }
    else{
        newUser=User({
            ...req.body,
            password:hashedPassword,
            avater:null
        })
    }

    try {
        let result=await newUser.save();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
   

}
module.exports={
    newRegisteruser,
}