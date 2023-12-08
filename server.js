const express = require("express");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const userRoute = require("./server/routes/userRoutes");
const errorHandler = require("./server/middleWare/errorMiddleware");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const fileupload = require("express-fileupload");
const path = require("path");
const app = express();

const expressLayout = require("express-ejs-layouts");

// Passport Config

require("./server/middleWare/passport")(passport);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// // Routes
// app.get("/", (req, res) => {
//   res.render("index");
// });

// Templating Engine
app.use(expressLayout);

app.set("view engine", "ejs");

//Error Middleware
app.use(errorHandler);

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use(fileupload({ useTempFiles: true }));

// Routes Middleware
app.use("/", userRoute);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
