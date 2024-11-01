const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/auth");

const JWT_SECRET = "vipul";

router.get("/profile/view", authenticateUser, async (req, res) => {
  try {
    const token = req.cookies.token;
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(loggedInUser.id).select("-password");
    res.send(user);
  } catch (err) {
    return res.status(401).send("please loggedIn");
  }
});

router.patch("/profile/edit", authenticateUser, async (req, res) => {
  try {
    const token = req.cookies.token;
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const user = await User.findByIdAndUpdate(loggedInUser.id, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(401).send("please loggedIn");
    }
    res.json({
      message: "profile updated successfully",
      user,
    });
  } catch (err) {
    return res.status(401).send("please loggedIn");
  }
});

router.patch("/profile/change-password", authenticateUser, async (req, res) => {
  try {
    const token = req.cookies.token;
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(loggedInUser.id);

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).send("password not matched");
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({
      message: "password changed successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send("please loggedIn " + err);
  }
});

module.exports = router;
