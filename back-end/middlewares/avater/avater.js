const multer=require('multer');
const path=require('path')
const cloudinary = require("cloudinary"); 
require('dotenv').config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const upload_folders=path.join(__dirname, '..', '..', 'public' ,'uploads','avatars');


let storage;
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV=="development")
{
    storage=multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,upload_folders)
        },
        filename:function(req,file,cb){
            const fileExt=path.extname(file.originalname)
            const uniqueSuffix =Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix+fileExt)
        }
    })
}
else{
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
      });
    
      storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: 'avatars',
          allowed_formats: ['jpg', 'jpeg', 'png'],
          public_id: (req, file) => {
            const ext = path.extname(file.originalname);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return file.fieldname + '-' + uniqueSuffix+ext;
          }
        }
      });
}

const upload = multer({ storage: storage })
function uploads(req,res,next){
    upload.single('avaters')(req,res,next)
    console.log("avater upload")
}
module.exports=uploads