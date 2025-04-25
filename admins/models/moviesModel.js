  const mongoose = require("mongoose");

  const movieSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      maxlength: [500, "Name cannot exceed 500 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    imagePath: {
      type: String,
      required: true, // The path to the thumbnail image
    },
    videoPath: {
      type: String,
      required: true, // The path to the video file
    },
    canSee: {
      type: Boolean,
    },
  });

  const Movie = mongoose.model("Movie", movieSchema);

  module.exports = Movie;
