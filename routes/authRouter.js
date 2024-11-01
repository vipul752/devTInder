const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "vipul";

router.post("/signup", async (req, res) => {

    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName || !emailId || !password) {
      return res.status(400).send("Please provide all details");
    }
  
    const userExists = await User.findOne({ emailId});
    if(userExists){
      return res.status(400).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password,10);
  
    const user = new User({
      firstName,
      lastName,
      emailId,
      password:hashedPassword,
    });
    const token = jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"1h"});
  
  
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
  
    await user.save();
    res.send("User created successfully");
});
  
router.post("/login", async (req, res) => {
    const{emailId, password} = req.body;
  
    if(!emailId || !password){
      return res.status(400).send("Please provide email and password");
    }
  
    const user = await User.findOne({emailId});
    if(!user){
      return res.status(400).send("User not found");
    }
  
    const isPasswordMatch = bcrypt.compare(password,user.password);
    if(!isPasswordMatch){
      return res.status(400).send("Invalid credentials");
    }
  
    const token = jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"1h"});
  
    res.cookie("token",token);
    res.send("Logged in successfully");
  
})

router.post("/logout", (req, res) => {
  res.cookie("token","",{expires:new Date(0)});
  res.send("Logged out successfully");
})

module.exports = router;