const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); // Adjust the path to your User model
const JWT_SECRET = "vipul";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token; // or from headers if you’re using headers for token
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(loggedInUser.id).select("-password"); // Fetch user and exclude password

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user to req.user
    next(); // Move to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateUser;
