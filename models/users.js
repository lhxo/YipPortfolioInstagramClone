const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/cyipprogram/image/upload/v1636641172/nopic_qy7pnt.png"
    },

    resetToken: String,
    expireToken: Date,

    followers:[{type:ObjectId,ref:"User"}],

    following:[{type:ObjectId,ref:"User"}]


})

mongoose.model("User",userSchema)