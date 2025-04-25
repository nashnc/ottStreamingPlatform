var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
// import the product model
const Movie = require("../models/moviesModel");
const User = require("../models/userModel");
// for generating  secret key
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// signup api

router.post("/signupapi", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and Confirm Password do not match" });
  }

  // Check all fields are not empty
  const user = new User({ name, email, password });
  const validationError = user.validateSync();

  if (validationError) {
    return res.status(400).json({ error: validationError.errors });
  }

  // Check if the email is already taken
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ message: "Email already taken" });
        return;
      }
      // Hash the password using bcrypt
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return;
      // Create a new user in MongoDB
      const newUser = new User({ name, email, password: hashedPassword });
      return newUser.save();
    })
    .then((savedUser) => {
      if (!savedUser) return; // Prevents sending multiple responses
      // Respond with success
      res.status(201).json({ message: "Account created successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});
// signupapi

// loginapi

// Login API
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET); // Make sure it's a random string

router.post("/loginapi", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "email not-found" });
    }
    const block = await user.isBlocked;
    console.log(block);

    if (block) {
      return res
        .status(401)
        .json({ message: "account is blocked contact admin" });
    }
    // Fix the bcrypt password comparison
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Use the hardcoded JWT_SECRET directly
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token in the response
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//login apii

// Authentication middleware
// Authentication middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    req.userId = decoded.userId; // This is set correctly
    // You need to fetch the user from the database and attach it to req.user
    User.findById(req.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User  not found" });
        }
        req.user = user; // Attach the user to the request
        next();
      })
      .catch((err) => {
        return res.status(500).json({ message: "Internal Server Error" });
      });
  });
};

// Password change route
router.patch("/changpwordapi", verifyToken, async (req, res) => {
  try {
    const { password, newPassword, confirmNewPassword } = req.body;

    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "New password and confirmation password don't match",
      });
    }

    // User is already authenticated and available in req.user from the middleware
    const user = req.user; // This should now be defined

    // Compare the old password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "You entered the wrong password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    // Respond with success
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// change password

// logut api
router.post("/logoutapi", (req, res) => {
  try {
    // Clear the JWT cookie by setting it to an expired value
    res.clearCookie("token"); // 'token' is the name of your cookie

    // Send a response back indicating that the logout was successful
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// logut api

// for getting movies
// url
// http://localhost:3000/api/retrieve_movie_api

router.get("/retrieve_movie_api", verifyToken, (req, res) => {
  Movie.find()
    .then((data) => {
      const serializedData = data.map((movie) => ({
        id: movie._id,
        name: movie.name,
        description: movie.description,
        imagePath: movie.imagePath,
        canSee: movie.canSee, // Add this if it exists in your schema
      }));
      res.status(200).json({ data: serializedData });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

//reading ends
// wishlisted reading
// url
// http://localhost:3000/api/retrieve_user_wishlist/{uid}

// URL: http://localhost:3000/api/retrieve_user_wishlist
router.get("/retrieve_user_wishlist", verifyToken, (req, res) => {
  const userId = req.userId; // Use the userId from the verified token

  User.findById(userId)
    .populate("wishList.movieId") // Populating the movie details from the wishList
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User  not found" });
      }

      const serializedMovies = user.wishList.map((item) => ({
        id: item.movieId._id, // Movie ID
        name: item.movieId.name,
        description: item.movieId.description,
        imagePath: item.movieId.imagePath,
        canSee: item.movieId.canSee, // Assuming canSee is a property in the movie schema
      }));

      res.status(200).json({ data: serializedMovies });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// wishlisted reading
// watch history
// url
// http://localhost:3000/api/retrieve_user_watched/{uid}
//
// URL: http://localhost:3000/api/retrieve_user_watched
router.get("/retrieve_user_watched", verifyToken, (req, res) => {
  const userId = req.userId; // Use the userId from the verified token

  User.findById(userId)
    .populate("watchHistory.movieId") // Populate movie details
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User  not found" });
      }

      // Sort the watchHistory array by the watchedOn date in descending order
      const sortedWatchHistory = user.watchHistory.sort(
        (a, b) => b.watchedOn - a.watchedOn
      ); // Sorting in descending order

      // Serialize the movie data
      const serializedMovies = sortedWatchHistory.map((item) => ({
        id: item.movieId._id, // Movie ID
        name: item.movieId.name,
        description: item.movieId.description,
        imagePath: item.movieId.imagePath,
        canSee: item.movieId.canSee, // Assuming canSee is a property in the movie schema
        watchedOn: item.watchedOn, // Add watched date if needed
      }));

      res.status(200).json({ data: serializedMovies });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// watch history
// toggel wising

// URL: http://localhost:3000/api/toggle_movie_wishlist/{userId}
// PATCH request to add/remove a movie from user's wish list
router.patch("/toggle_movie_wishlist", verifyToken, (req, res) => {
  const { movieId } = req.body; // Get movieId from request body
  const userId = req.userId; // Use the userId from the verified token

  // Validate movieId
  if (!movieId) {
    return res.status(400).json({ message: "Movie ID is required" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User  not found" });
      }

      // Check if the movie is already in the wish list
      const movieExists = user.wishList.some(
        (item) => item.movieId.toString() === movieId
      );

      // Toggle movie in the wish list
      const update = movieExists
        ? { $pull: { wishList: { movieId } } } // Remove the movie
        : { $addToSet: { wishList: { movieId } } }; // Add the movie

      User.findByIdAndUpdate(userId, update, { new: true })
        .then((updatedUser) => {
          const action = movieExists ? "removed from" : "added to";
          res
            .status(200)
            .json({ message: `Movie ${action} wish list`, data: updatedUser });
        })
        .catch(() => {
          res.status(500).json({ message: "Internal Server Error" });
        });
    })
    .catch(() => {
      res.status(500).json({ message: "Internal Server Error" });
    });
});
// toggle wishing
//
//
// hisrtoy

// URL: http://localhost:3000/api/add_to_watch_history
// PATCH request to add a movie to the user's watch history

router.patch("/add_to_watch_history", verifyToken, async (req, res) => {
  const { movieId } = req.body;
  const userId = req.userId;

  if (!movieId || !userId) {
    return res.status(400).json({ message: "Movie ID and User ID are required" });
  }

  try {
    // Validate movieId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.watchHistory.push({ movieId, watchedOn: Date.now() });
    await user.save();

    return res.status(200).json({ message: "Movie added to watch history", user });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});






// URL: http://localhost:3000/api/view_movies/:id
router.get("/view_movies/:id", (req, res) => {
  const movieId = req.params.id; // Get the movie ID from the URL parameter

  // Find the movie by its ID
  Movie.findById(movieId)
    .then((movie) => {
      // If the movie is not found, send a 404 response
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" }); // Returning 404 as JSON if movie is not found
      }
      // If the movie is found, send the movie data as JSON
      res.status(200).json({
        id: movie._id.toString(), // Convert the _id to a string
        name: movie.name,
        description: movie.description,
        imagePath: movie.imagePath,
        videoPath: movie.videoPath,
        canSee: movie.canSee, // Assuming canSee is a property in your schema
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" }); // Return 500 error as JSON in case of server issue
    });
});

//
//
// history

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};
console.log(generateSecretKey());
module.exports = router;

//
