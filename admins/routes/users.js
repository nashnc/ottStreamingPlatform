var express = require("express");
var router = express.Router();
const User = require("../models/userModel");

// GET all users
router.get("/", async function (req, res) {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const users = await User.find({}, "name email isBlocked");
    if (!users || users.length === 0) {
      console.log("No users found in database");
      return res.render("users/viewu", { users: [] });
    }
    console.log("Users fetched:", users);
    res.render("users/viewu", { users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error retrieving users");
  }
});

// POST route to toggle isBlocked
router.post("/toggle-block", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const { userId, isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: isBlocked },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
});

// GET user watch history
router.get("/view/:id", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const user = await User.findById(
      req.params.id,
      "name email watchHistory"
    ).populate("watchHistory.movieId", "name"); // Populate movieId with name only
    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log("User watch history:", user.watchHistory);
    res.render("users/viewp", { user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Error retrieving user history");
  }
});

module.exports = router;
