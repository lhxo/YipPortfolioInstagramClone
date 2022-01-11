const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const mongoose = require('mongoose')
const User = mongoose.model("User")

module.exports = (req,res,next)=>{

    // both are the same thing
    // const authorization = req.headers.authorization;
    // // shorter version of the shit above
    // const {authorization} = req.headers;
    // const {authorization, user_agent} = req.headers;
    // // The above resolves to:
    // const authorization = req.headers.authorization;
    // const user_agent = req.headers.user_agent:

    const {authorization} = req.headers
    //authorization === Bearer tokensdfgdfhhasddd
    if(!authorization){
        return res.status(401).json({error:"You must be logged in"})
    }
    const token = authorization.replace("Bearer ","")
    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"You must be logged in"})
        }

        const{_id} = payload
        User.findById(_id).then(userdata=>{
            req.user = userdata
            next()
        })
    })
}