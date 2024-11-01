const express = require("express");
const router = express.Router();
const connectionRequest = require("../models/connectionRequest");
const authenticateUser = require("../middleware/auth");
const User = require("../models/userSchema");

router.post(
  "/connection/send/:status/:toUserId",
  authenticateUser,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status");
      }

      if (fromUserId === toUserId) {
        throw new Error("You can't send connection request to yourself ");
      }

      const toUser = await User.findOne({ _id: toUserId });

      if (!toUser) {
        throw new Error("User not found");
      }

      const existingConnectionRequest = await connectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        throw new Error("Connection request already exists");
      }

      const newConnectionRequest = new connectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const connectionData = await newConnectionRequest.save();

      return res.status(200).json({
        message:
          req.user.firstName +
          " has sent a connection request to " +
          toUser.firstName,
        data: connectionData,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: error.message });
    }
  }
);

router.post(
  "/connection/review/:status/:requestId",
  authenticateUser,
  async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status");
      }

      const connectionRequestData = await connectionRequest.findOne({
        _id: requestId,
        toUserId: req.user._id,
        status: "interested",
      });

      if (!connectionRequestData) {
        throw new Error("Connection request not found");
      }

      connectionRequestData.status = status;

      const data = await connectionRequestData.save();

      res.send({ message: "Connection request reviewed successfully", data });
    } catch (error) {
      console.error("Error reviewing connection request:", error);
      res.status(500).send({ error: "Failed to review connection request" });
    }
  }
);

module.exports = router;
