const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Email field is required"],
  },
  password: {
    type: String,
    required: [true, "Password field is required"],
    minlength: [4, "At least 4 characters required"],
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  wishList: [
    {
      movieId: {
        type: ObjectId,
        ref: "Movie", // assuming you're referencing a 'Movie' collection
      },
    },
  ],
  watchHistory: [
    {
      movieId: {
        type: ObjectId,
        ref: "Movie", // assuming you're referencing a 'Movie' collection
      },
      watchedOn: {
        type: Date,
        default: Date.now, // Get the current date
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
