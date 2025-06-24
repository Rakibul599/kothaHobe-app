const express=require('express');
const { loggedIn, logout } = require('../controler/loginController');


const router=express.Router();
router.post('/',loggedIn);
router.get('/logout',logout);

module.exports=router;