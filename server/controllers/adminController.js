const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const passport = require("passport");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER Student
const register = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  let errors = [];

  // Validation
  if (!email || !password) {
    res.status(400);
    errors.push({ msg: "Please enter all fields" });
  }
  if (password.length < 8) {
    res.status(400);
    errors.push({ msg: "Password must be at least 8 characters" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      fullname,
      email,
      password,
    });
  } else {
    // Check if user email already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      res.status(400);
      errors.push({ msg: "Email has already been registered" });
    }

    // Create new user
    const admin = await Admin.create({
      email,
      fullname,
      password,
    });

    //   Generate Token
    const token = generateToken(admin._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    if (admin) {
      const { _id, fullname, email, password } = admin;

      req.flash("success_msg", "You are now registered and can log in");
      res.redirect("/login");
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }
});

// Login User
const login = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/test",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout User
const logout = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

// Get single student data
const singleStudentData = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  // Find the student in the database by ID
  const student = await Student.findById(studentId);

  // Render the student data using the student.ejs template
  res.render("students", { student });
});

module.exports = {
  register,
  login,
  singleStudentData,
  logout,
};
