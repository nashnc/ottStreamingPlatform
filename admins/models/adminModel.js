const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email field is required"],
  },
  password: {
    type: String,
    required: [true, "Password fields is required"],
    minlength: [4, "At least 4 characters required"],
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
