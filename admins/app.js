// app.js

var createError = require("http-errors");
var express = require("express");
var app = express();

const session = require("express-session");
var path = require("path");
var multer = require("multer");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var movieRouter = require("./routes/movies");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const db = require("./database/db");

const apiRoutes = require("./routes/api"); // Updated import

// View engine setup
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "your-secret-key", // A secret key to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
  })
);

// Layout setup
app.use(expressLayouts);
app.set("layout", "layouts/main-layout");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use the API and CRUD API routes
app.use("/api", apiRoutes);

// Other routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/movies", movieRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
