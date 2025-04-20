const express=require('express');
const checkAuth = require('../middlewares/auth/cheackAuth');
const { loginAuth } = require('../controler/loginController');

const router=express.Router();
router.get('/',checkAuth,loginAuth)
module.exports=router