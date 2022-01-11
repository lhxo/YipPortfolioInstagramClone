const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

//seeing every post ever
router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

//seeing every post ever
router.get('/explore',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

//seeing every post from the people you are following
router.get('/getsubpost',requireLogin,(req,res)=>{
    //{postedBy:{$in:req.user.following}}
    //if postedBy is within req.user.following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})



//creating a post
router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,img} = req.body
    if(!title || !body ||!img){
        res.status(422).json({error:"Please add all the fields"})
    }

    // for testing
    // console.log(req.user)
    // res.send("ok")

    req.user.password = undefined
    const post = new Post({
            //if key:value are the same then you can condense
            //down to 1 word
            //title:title
            title,
            body,
            photo:img,
            postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
    
})

//seeing all posts from myself
router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}//tracks the person who likes the post
    
    },{
        new:true
    })
        .populate("comments.postedBy","_id name")
        .populate("postedBy", "_id name")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err})
            } else {
                res.json(result)
            }
        })
})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}//tracks the person who likes the post
    },{
        new:true
        
    })
        .populate("comments.postedBy","_id name")
        .populate("postedBy", "_id name")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err})
            } else {
                res.json(result)
        }
    })
})

router.put('/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
        .populate("comments.postedBy","_id name")
        .populate("postedBy", "_id name")
        .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})

router.put('/deleteComment',requireLogin,(req,res)=>{
    // const comment = item.comments[record]
    
    // Post.findByIdAndUpdate(req.body.postId,{
    //     $splice:{comments:comment}
    // },{
    //     new:true
    // })
    //     .populate("comments.postedBy","_id name")
    //     .populate("postedBy", "_id name")
    //     .exec((err,result)=>{
    //     if(err){
    //         return res.status(422).json({error:err})
    //     } else {
    //         res.json(result)
    //     }
    // })
})

router.delete('/deletepost', requireLogin, (req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            }).catch(err=>{
                console.log(err)
            })
        }
    })
})

module.exports = router