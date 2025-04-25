const bcrypt = require("bcrypt");
var express = require("express");
const { errors } = require("formidable");
var router = express.Router();
const Admin = require("../models/adminModel");
const Movie = require("../models/moviesModel");
const { validationResult } = require("express-validator");
const { validateEmail, validatePassword } = require("./customValidators");
const { ChangeStream } = require("mongodb");
// router
//   .get("/signup", (req, res) => {
//     res.render("signup", { message: null, error: null });
//   })
//   .post("/signup", (req, res) => {
//     const { email, password, confirmPassword } = req.body;
//     const user = new Admin({ email, password });
//     const validationError = user.validateSync();

//     // Check if the password and confirm password match
//     if (password !== confirmPassword) {
//       return res.render("signup", {
//         message: "Password and Confirm Password do not match",
//         error: null,
//       });
//     }

//     // Check all fields are not empty
//     if (validationError) {
//       return res.render("signup", {
//         message: null,
//         error: validationError.errors,
//       });
//     }
//     // Check if the username is already taken
//     Admin.findOne({ email })
//       .then((existingUser) => {
//         if (existingUser) {
//           return res.render("signup", {
//             message: "Email already taken",
//             error: null,
//           });
//         } else {
//           //hash the password using bcrypt
//           return bcrypt.hash(password, 10);
//         }
//       })
//       .then((hashedPassword) => {
//         // Create a signup user in MongoDB
//         const signupUser = new Admin({ email, password: hashedPassword });
//         return signupUser.save();
//       })
//       .then(() => {
//         // Redirect to a success page or login page
//         res.redirect("/login");
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   });

router
  .get("/login", (req, res) => {
    res.render("login", { errors: [], message: null });
  })
  .post(
    "/login",
    [
      // Add custom validation that required/imported
      validateEmail,
      validatePassword,
    ],
    function (req, res) {
      // Access the validation errors from the request object
      const errors = req.validationErrors || [];

      // Validate the request
      const validationResultErrors = validationResult(req);
      if (!validationResultErrors.isEmpty()) {
        // Merge the errors from validation result into the existing errors
        errors.push(...validationResultErrors.array());
      }

      if (errors.length > 0) {
        // There are validation errors, render the form with errors
        res.render("login", { errors, message: null });
      } else {
        const { email, password } = req.body;
        let foundUser; // Declare foundUser here

        Admin.findOne({ email })
          .then((user) => {
            console.log(user);
            if (!user) {
              return res.render("login", {
                message: "Incorrect Email Address.",
                errors: [],
              });
            }
            foundUser = user; // Assign user to foundUser
            return bcrypt.compare(password, user.password);
          })
          .then((isPasswordValid) => {
            if (!isPasswordValid) {
              return res.render("login", {
                message: "Incorrect password.",
                errors: [],
              });
            }
            //

            //

            // Set user's ID and email in the session
            req.session.userId = foundUser._id;
            req.session.userEmail = foundUser.email;

            Movie.find()
              .then((movies) => {
                // res.render("./movies/viewm", { data: data });
                // res.render("hello", { email: email, movies: movies });
                res.render("hello", { email: foundUser.email, movies: movies });
              })
              .catch((error) => {
                console.error(error);
              });

            console.log(req.session); // Debugging line
            req.session.userId = foundUser._id; // Where error occu
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Internal Server Error");
          });
      }
    }
  );
// router.get("/", function (req, res) {
//   const email = req.session.userEmail || null;
//   res.render("hello-world", { email: email });
// });

router.get("/", function (req, res) {
  // const email = "tesintg";
  if (!req.session.userId) return res.redirect("/login");

  const email = req.session.userEmail || null;
  const username = email?.split("@")[0] || "No email provided";
  console.log(`Username: ${username}`);

  Movie.find()
    .then((movies) => {
      // res.render("./movies/viewm", { data: data });
      res.render("hello", { email: username, movies: movies });
    })
    .catch((error) => {
      console.error(error);
    });
});
router.post("/toggle-availability", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.body.movieId,
      { canSee: req.body.isAvailable },
      { new: true }
    );
    res.json({ success: true, canSee: movie?.canSee });
  } catch {
    res.status(500).json({ success: false, message: "Error updating movie." });
  }
});


router.get("/", function (req, res) {
  if (!req.session.userId) return res.redirect("/login");

  const email = req.session.userEmail || null;
  const username = email?.split("@")[0] || "No email provided";

  Movie.find()
    // First batch

    .then((movies) => {
      res.render("hello", { email: username, movies: movies });
    })
    .catch((error) => {
      console.error(error);
    });
});

//route for handling form submission with validations

//for about-us page

// Render the Change Password page
router.get("/admpassc", function (req, res) {
  if (!req.session.userId) return res.redirect("/login");

  res.render("changepas", { errors: [], message: null });
});

// Handle the POST request for Change Password
router.post("/admpassc", (req, res) => {
  const { current_password, new_password, confirm_new_password } = req.body;
  const userEmail = req.session.userEmail; // Assuming the user email is stored in session
  console.log(userEmail);

  // Check if the user is logged in

  Admin.findOne({ email: userEmail }) // Fetch user details based on session email
    .then((user) => {
      if (!user) {
        return res.render("changepas", {
          message: "User not found.",
          errors: [],
        });
      }

      // Check if current password matches the stored password
      return bcrypt
        .compare(current_password, user.password)
        .then((isPasswordValid) => {
          if (!isPasswordValid) {
            return res.render("changepas", {
              message: "Incorrect current password.",
              errors: [],
            });
          }

          // Ensure new password and confirm password match
          if (new_password !== confirm_new_password) {
            return res.render("changepas", {
              message: "New password and confirm password do not match.",
              errors: [],
            });
          }

          // Hash the new password before saving
          return bcrypt.hash(new_password, 10);
        })
        .then((hashedPassword) => {
          // Update the user's password in the database
          user.password = hashedPassword;
          return user.save();
        })
        .then(() => {
          // Redirect to a success page or homepage after password change
          res.redirect("/");
        })
        .catch((error) => {
          console.error(error);
          res.render("changepas", {
            message: "An error occurred. Please try again.",
            errors: [],
          });
        });
    })
    .catch((error) => {
      console.error(error);
      res.render("changepas", {
        message: "An error occurred. Please try again.",
        errors: [],
      });
    });
});

//route for logout

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send("Error");
    } else {
      res.redirect("/login");
    }
  });
});
module.exports = router;
