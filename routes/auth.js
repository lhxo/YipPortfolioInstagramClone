const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {SENDGRID_API, EMAIL} = require('../config/keys')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}))

//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

///<!-----Below are useful notes from Gerry----->

// Two functions below are the exact same thing (but not really, but you'll learn later :))
/*
const asdf = function(first, second) {

};

const evilTwin = (first, second) => {

}

// Functions can be stored as variables. A function can be passed into a function as a function argument
router.post('/freeSpin', evilTwin);
*/

// Callbacks, aka "run this function after I'm done doing my work", said the function.
// AKA, the "deliver food to your home" model of computing
/*
const thing = (thisCanBeTheNameOfAnyFunction) => {
    let asdf = "fdsa";

    if ... {
        thisCanBeTheNameOfAnyFunction()
    }
}

// Uber Eats, deliver me from hunger
const delivery = (restaurantName, item, firestReactionFromM) => {
    const accepted = validateOrder("1234");
    if (!accepted) {
        // Call the other bad function... damn :(
        thing();
        // Ain't no pride in being a theif, chief...
        return;
    }

    // We can call the function that we were provided, aka how would "I" react or do?
    firstReactionFromMe(restaurantName, item);
}
*/

// Old style callbacks, aka dinosaur javascript
/*
dosomething.on('asdf', () => {
    doanotherthing('fdsafdsa', (err) => {

    })
})
*/
// New style (promises), created to solve issue of "callback hell"
/*
dosomething('asdf')
.then(() => {
    return doanotherthing('fdsafdsa');
})
.then((err) => {
    ...
})
// Error handling
.err((e) => console.log(e));
*/
// Even newer style (async/await), which was made to make the above easier to read and maintain
/*

// If an async function await throws, then we throw
const {} = await dosomething('asdf');
const err = await doanotherthing('fdsafdsa');
...

*/


///<!-----Above are useful notes from Gerry----->


/* This is for testing purposes
// I created a page called proected so I could
// test authenticating json web tokens

router.get('/protected',requireLogin,(req,res)=>{
    res.send("hello user")
})
*/ 


router.post('/signup',(req,res)=>{
    //signup page will request a name, email, and password. If any of the fields are not present then it will sen an error
    const {name,email,password,pic} = req.body
    // Lines below are the same as the line above:
    //const body = req.body;
    //const name = body.name;
    //const email = body.email;
    //const password = body.password;

    if(!email || !password || !name){
        return res.status(422).json({error:"Please add all the fields"})
    }
    //User.findOne compares the email to existing emails in the database using Key:Value. Key email : Email inputted by the user. If the email already exists, send error. 
    User.findOne({email:email}).then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"Email already exists."})
        }
        //This grabs the inputted password to hash into our system. The number is for how long you want the hash to be so it is harder to decrypt. It is defaulted at 10.
        bcrypt.hash(password,16)
        .then(hashedpassword=>{
            //If the user does not exist. Create a new array of User with the following values of email, password, and name
            const user = new User({
                email,
                password:hashedpassword,
                name,
                pic
            })
            //This saves the information to the database..
            user.save()
            .then(user=>{
                transporter.sendMail({
                    to:user.email,
                    from:"noreplycyipinstaclone@gmail.com",
                    subject:"Signup Success",
                    html:"<h1>test</h1>"

                })
                res.json({message:"saved successfully"})
            })
            //Errors if there is an unsuccessful upload to the database
            .catch(err=>{
                console.log(err)
            })
        })
    })
    //Errors if found already exist in database
    .catch(err=>{
        console.log(err)
    })
})

router.post('/login',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        //adding the return stops the application from going further after the error is sent
        return res.status(422).json({error:"please provide an email or password."})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"Successfully signed in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email, followers, following, pic} = savedUser
                res.json({token,user:{_id,name,email, followers, following, pic}})

            } else {
                return res.status(422).json({error:"Invalid email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })    
    })
})

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User does not exist with that email"})
            }
            user.resetToken = token
            //time is in miliseconds, 360000 is equiv to 1 hour
            //Date.now() sets current day and current time
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"noreplycyipinstaclone@gmail.com",
                    subject:"Password Reset",
                    html:
                    `
                    <p>You requested for a password reset</p>
                    <h5>Click this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                })
            })
        })
    })
})

router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated success"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})

module.exports = router