const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/userSchema");

router.get("/user/request/received", authenticateUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestData = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id, status: "interested" }],
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "about",
      "age",
      "skills",
    ]);

    res.send({ message: "Received Connection Request", connectionRequestData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "failed to get user",
      error: error.message,
    });
  }
});

router.get("/user/connection/accepted", authenticateUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestData = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "age",
        "skills",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "age",
        "skills",
      ]);

    if (!connectionRequestData || connectionRequestData.length === 0) {
      return res.status(404).send({ message: "No Connection Found" });
    }

    const data = connectionRequestData.map((collection) => {
      if (collection.fromUserId._id === loggedInUser._id) {
        return collection.toUserId;
      }
      return collection.fromUserId;
    });

    res.status(200).send({
      message: "User Connections",
      connections: data,
    });
  } catch (error) {
    console.error("Error retrieving connections:", error);
    res
      .status(500)
      .send({ message: "Failed to get connections", error: error.message });
  }
});

router.get("/feed", authenticateUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();

    connectionRequests.forEach((connection) => {
      hideUserFromFeed.add(connection.fromUserId);
      hideUserFromFeed.add(connection.toUserId);
    });

    console.log(hideUserFromFeed);

    const user = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select("firstName lastName about age skills");

    res.status(200).send({ message: "Feed", data: user });
  } catch (error) { 
    res.status(400).send({ message: "Failed to get feed", error: error });
  }
});

module.exports = router;
