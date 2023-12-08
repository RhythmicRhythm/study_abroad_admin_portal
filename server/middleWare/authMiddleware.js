const asyncHandler = require("express-async-handler");
const Student = require("../models/studentModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      res.status(401);
      console.log("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Get user id from token
    const student = await Student.findById(verified.id).select("-password");

    if (!student) {
      res.redirect("/login"); // Redirect to login if user not found
      return;
    }

    req.student = student;
    next();
  } catch (error) {
    res.redirect("/login"); // Redirect to login on other errors
  }
});

module.exports = protect;
