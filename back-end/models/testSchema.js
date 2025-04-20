const mongoose=require('mongoose');
const testSchema=mongoose.Schema({
    name:String,
    phone:Number,
})
const testData=mongoose.model('Testdata',testSchema);
module.exports=testData;