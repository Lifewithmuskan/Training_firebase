const mongoose= require('mongoose');
const user_information= new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
    },
    last_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    education:{
        type:String,
        required:true
    },
    department:{
        type:String,
        required:true,
    },
    position:{
        type:String,
        required:true,
    },
});

const user=mongoose.model('user',user_information);
module.exports=user;