const bcrypt = require("bcrypt");
const User=require('../models/People');
const jwt = require("jsonwebtoken");

async function loggedIn(req,res,next) {
    try {
        const user=await User.findOne({email:req.body.email})
        if(user)
        {
            const isValidpassword=await bcrypt.compare(
                req.body.password,
                user.password
            );
            if(isValidpassword)
            {
                const userObject = {
                    userid: user._id,
                    username: user.name,
                    email: user.email,
                    avatar: user.avater ?? null,
                  };

                  const token = jwt.sign(userObject, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRY,
                  });

                  res.cookie(process.env.COOKIE_NAME, token, {
                    maxAge: process.env.JWT_EXPIRY,
                    httpOnly: true,
                    signed: true,
                    secure: true, 
                    sameSite: "None", 
                  });


                console.log("User is logged in")
                res.status(200).json({success:true});
                

            }
            else{
                return res.status(401).json({msg:"Login failed! Please try again."})
            }
        }
        else{
            return res.status(401).json({msg:"Login failed! Please try again."})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({err:error});
    }
   
}
function loginAuth(req, res, next) {
    res.status(200).json({ msg: "You are authenticated", user: req.user });
}
function logout(req,res,next){
    res.clearCookie(process.env.COOKIE_NAME,{
        httpOnly: true,
        secure: true, 
        sameSite: "None", 
      });
      return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports={
    loggedIn,
    loginAuth,
    logout
}