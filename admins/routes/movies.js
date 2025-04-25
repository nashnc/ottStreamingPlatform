var express = require("express");
var router = express.Router();
var multer = require("multer");
const User = require("../models/userModel");

const Movie = require("../models/moviesModel");

// Multer setup for storing files
let thumb, movieFile;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, "public/images"); // For images
    } else if (file.fieldname === "video") {
      cb(null, "public/videos"); // For videos
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "image") {
      thumb = file;
      cb(null, thumb.originalname); // Keep the original name for the image
    } else if (file.fieldname === "video") {
      movieFile = file;
      cb(null, movieFile.originalname); // Keep the original name for the video
    }
  },
});

const upload = multer({ storage: storage });
router.get("/add_movie", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  res.render("./movies/add", { message: "" });
});
// Add movie route - handling both image and video uploads
// Add movie route - handling both image and video uploads
router.post(
  "/add_movie",
  upload.fields([{ name: "image" }, { name: "video" }]),
  async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    try {
      const { image, video } = req.files;
      const { name, description } = req.body;

      // Check if both image and video are provided
      if (!image || !video) {
        return res.render("./movies/add", {
          message: "Both image and video files are required.",
        });
      }

      const imageFile = image[0];
      const videoFile = video[0];

      // Validate image file type (png, jpg, jpeg)
      if (
        !["png", "jpg", "jpeg"].includes(imageFile.mimetype.split("/").pop())
      ) {
        return res.render("./movies/add", {
          message: "Invalid image type. Only png, jpg, jpeg are allowed.",
        });
      }

      // Validate video file type (mp4, avi)
      if (!["mp4", "avi"].includes(videoFile.mimetype.split("/").pop())) {
        return res.render("./movies/add", {
          message: "Invalid video type. Only mp4, avi are allowed.",
        });
      }

      // Create Movie object
      const movie = new Movie({
        name,
        description,
        imagePath: imageFile.originalname,
        videoPath: videoFile.originalname,
        canSee: true,
      });

      // Validate movie object
      const validationError = movie.validateSync();
      if (validationError) {
        return res.render("./movies/add", {
          message: "Validation error occurred.",
        });
      }

      await movie.save();

      // If everything is okay, only trigger the success message on the frontend (no body display)
      return res.render("./movies/add", { message: "success" });
    } catch (error) {
      console.error(error);
      return res.render("./movies/add", {
        message: "An error occurred while processing the file.",
      });
    }
  }
);

router.get("/view_movies/:id", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const movieId = req.params.id; // Get movie ID from URL parameter

  // Find the movie by its ID
  Movie.findById(movieId)
    .then((movie) => {
      // If the movie is not found, send a 404 response
      if (!movie) {
        return res.status(404).render("404", { message: "Movie not found" }); // You can create a custom 404 page if needed
      }
      // If the movie is found, render the view with the movie data
      res.render("./movies/viewm", { movie: movie }); // Make sure the view file exists in the correct path
    })
    .catch((error) => {
      console.error(error);
      res.status(500).render("error", { message: "Internal Server Error" }); // Render a custom error page if you prefer
    });
});

// Edit Movie - Handle the update form submission
// Edit Movie - Show the edit form
router
  .get("/edit_movies/:id", (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const movieId = req.params.id;
    console.log(`Looking for movie with ID: ${movieId}`); // Debugging log

    Movie.findById(movieId)
      .lean()
      .then((movie) => {
        if (!movie) {
          console.log(`Movie with ID ${movieId} not found`); // Log if not found
          return res.status(404).render("404", { message: "Movie not found" });
        }
        res.render("./movies/edit", {
          movie: movie,
          error: null,
          message: null,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render("error", { message: "Internal Server Error" });
      });
  })
  .post(
    "/edit_movies/:id",
    upload.fields([{ name: "image" }, { name: "video" }]),
    async (req, res) => {
      const movieId = req.params.id;
      const { image, video } = req.files; // Image and video files
      let { name, description } = req.body; // Form data
      name = name.trim();
      description = description.trim();

      let imagePath, videoPath;

      // If new image is uploaded, update the imagePath
      if (image && image[0]) {
        const imageFile = image[0];
        if (
          !["png", "jpg", "jpeg"].includes(imageFile.mimetype.split("/").pop())
        ) {
          return res.status(400).render("movies/edit", {
            error: "Invalid image type. Only png, jpg, jpeg are allowed.",
            movie: req.body,
            message: null,
          });
        }
        imagePath = imageFile.originalname;
      }

      // If new video is uploaded, update the videoPath
      if (video && video[0]) {
        const videoFile = video[0];
        if (!["mp4", "avi"].includes(videoFile.mimetype.split("/").pop())) {
          return res.status(400).render("movies/edit", {
            error: "Invalid video type. Only mp4, avi are allowed.",
            movie: req.body,
            message: null,
          });
        }
        videoPath = videoFile.originalname;
      }

      try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
          return res.status(404).render("404", { message: "Movie not found" });
        }

        imagePath = imagePath || movie.imagePath;
        videoPath = videoPath || movie.videoPath;

        const updatedMovie = new Movie({
          name,
          description,
          imagePath,
          videoPath,
        });

        const validationError = updatedMovie.validateSync();
        if (validationError) {
          return res.render("movies/edit", {
            movie: updatedMovie,
            error: validationError.errors,
            message: null,
          });
        }

        await Movie.findByIdAndUpdate(movieId, {
          name,
          description,
          imagePath,
          videoPath,
        });

        res.render("movies/edit", {
          movie: updatedMovie,
          error: null,
          message: "success",
        });
      } catch (e) {
        console.error(e);
        res.status(500).render("error", { message: "Failed to update movie" });
      }
    }
  );

// Edit Movie - Handle the update form submission

router.get("/viewstat", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const result = await User.aggregate([
      { $unwind: "$watchHistory" }, // Flatten watchHistory array
      {
        $addFields: {
          movieId: { $toObjectId: "$watchHistory.movieId" }, // Convert string to ObjectId
        },
      },
      {
        $group: {
          _id: "$movieId", // Group by movieId
          totalWatched: { $sum: 1 }, // Count total watched occurrences
        },
      },
      {
        $lookup: {
          from: "movies", // Join with movies collection
          localField: "_id", // Match with movieId in watchHistory
          foreignField: "_id", // Match with _id in movies
          as: "movieDetails", // Store matched movies in movieDetails
        },
      },
      { $unwind: "$movieDetails" }, // Flatten the movieDetails array
      {
        $project: {
          _id: 0, // Exclude _id from final output
          movieName: "$movieDetails.name", // Show movie name
          totalWatched: 1, // Show total watched count
        },
      },
      { $sort: { totalWatched: -1 } }, // Sort movies by totalWatched (descending)
    ]);

    console.log("Aggregation Result:", result);
    res.render("./movies/view", { movies: result }); // Render the final result
  } catch (err) {
    console.error("Error during aggregation:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
