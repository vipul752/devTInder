const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

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

    const data = connectionRequestData.map(
      (collection) => collection.fromUserId
    );
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

module.exports = router;
