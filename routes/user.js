const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")
const User = mongoose.model("User")


router.get('/user/:id',requireLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
         Post.find({postedBy:req.params.id})
         .populate("postedBy","_id name")
         .exec((err,posts)=>{
             if(err){
                 return res.status(422).json({error:err})
             }
             res.json({user,posts})
         })
    }).catch(err=>{
        return res.status(404).json({error:"User not found"})
    })
})

router.put('/follow',requireLogin,(req,res)=>{
    //Updates follow count of the person you want to follow
    User.findByIdAndUpdate(req.body.followId,{
        //Increments the follow count with the the logged in user
        $push:{followers:req.user._id}
    },
    //{new:true} is used with find/update to pass data of the newly updated value instead of it's previous value.
    {
        new:true
    },
    //passes err,result as an argument. if error send error, else find user's id and add the person you are following to your following array.
    (err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        //push adds to the array.
        User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId}
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
})

router.put('/unfollow',requireLogin,(req,res)=>{
    //Updates follow count of the person you want to follow
    User.findByIdAndUpdate(req.body.unfollowId,{
        //Increments the follow count with the the logged in user
        $pull:{followers:req.user._id}
    },
    //{new:true} is used with find/update to pass data of the newly updated value instead of it's previous value.
    {
        new:true
    },
    //passes err,result as an argument. if error send error, else find user's id and add the person you are following to your following array.
    (err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        //pull removes from an array.
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId}
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
})

router.put('/updatepic', requireLogin, (req,res)=>{
    User.findByIdAndUpdate(req.user._id, {$set:{pic:req.body.pic}},{new:true},(err,result)=>{
        if(err){
            return res.status(422).json({error:"Unable to upload"})
        }
        res.json(result)
    }).select("-password")
})

router.post('/search-users',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select("_id email")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err)
    })

})

module.exports = router