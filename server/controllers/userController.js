const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const passport = require("passport");
const verifier = new (require("email-verifier"))(process.env.EMAIL_VERIFY);
const nodemailer = require("nodemailer");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER Student
const register = asyncHandler(async (req, res) => {
  const { fullname, password, email } = req.body;

  const errors = [];

  // Validation
  if (!fullname || !email || !password) {
    errors.push({ msg: "Please enter all fields" });
  }
  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }

  if (errors.length > 0) {
    return res.status(400).render("register", {
      errors,
      fullname,
      email,
      password,
    });
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    errors.push({ msg: "Email has already been registered" });
    return res.status(400).render("register", {
      errors,
      fullname,
      email,
      password,
    });
  }

  // Verify email
  verifier.verify(email, (err, data) => {
    if (err) {
      console.error(err);
      req.flash("error_msg", "Internal error ...");
      res.redirect("/register");
    }

    console.log(data);
    if (
      data.formatCheck === "true" &&
      data.disposableCheck === "false" &&
      data.dnsCheck === "true" &&
      data.smtpCheck !== "false"
    ) {
      // Send welcome email to the user
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to QC-Investment || Development Finance",
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                }
                
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #fff;
                }
                
                h1 {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                }
                
                p {
                  margin-bottom: 10px;
                }
                
                .signature {
                  margin-top: 20px;
                  font-style: italic;
                  color: #777;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to QC-Investment || Development Finance </h1>
                <p><strong>Dear ${fullname}</strong></p>
                <p>Welcome, We are excited to have you as a member.</p>
                <p>Thank you for registering with us.</p>
                <p class="signature">Best regards,<br>QC-Investment Team</p>
              </div>
            </body>
          </html>
        `,
      };

      // Attempt to send the welcome email
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(error);
          req.flash(
            "error_msg",
            "An error occurred while sending the welcome email. Please try again later."
          );
          res.redirect("/register");
        } else {
          // Create new user
          User.create({
            fullname,

            email,
            password,
          })
            .then((user) => {
              if (user) {
                const { _id, fullname, email } = user;

                // Authenticate the user immediately after successful registration
                req.login(user, (err) => {
                  if (err) {
                    console.error(err);
                    req.flash(
                      "error_msg",
                      "An error occurred during login. Please try logging in manually."
                    );
                    res.redirect("/login");
                  } else {
                    console.log("success");
                    req.flash(
                      "success_msg",
                      "You are now Registered, Please Login to proceed"
                    );
                    res.redirect("/login");
                  }
                });
              } else {
                res.status(400);
                throw new Error("Invalid user data");
              }
            })
            .catch((error) => {
              console.error(error);
              req.flash(
                "error_msg",
                "An error occurred while creating the user. Please try again."
              );
              res.redirect("/register");
            });
        }
      });
    } else {
      req.flash("error_msg", "Please use a valid email address.");
      res.redirect("/register");
    }
  });
});

// Login User
const login = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
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

//Forgot Password
const forgotpassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!email) {
      req.flash("error_msg", "Please enter email");
      return res.redirect("/forgotpassword");
    }

    if (!user) {
      // User not found
      req.flash("error_msg", "No account with that email address exists.");
      return res.redirect("/forgotpassword");
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const fullname = user.fullname;

    // Set the code and  time in the user
    user.resetPasswordCode = code;
    user.resetPasswordCodeExpires = Date.now() + 3600000;

    // Save the updated user
    await user.save();

    // Send the code to the user's email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code",
      html: `<html>
              <head>
                <style>
                 
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .header h1 {
                    color: #333;
                    font-size: 24px;
                  }
                  .message {
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 18px;
                  }
                  .code {
                    display: block;
                    margin-top: 10px;
                    font-size: 32px;
                    color: #ff5500;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>QC-Investment || Development Finance </h1>
                  </div>
                  <p class="message">Hello ${fullname}</p>
                  <p class="message">We received a request to reset your password. Please use the following verification code to proceed:</p>
                  <span class="code">${code}</span>
                  <p class="message">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
              </body>
            </html>`,
    };

    await transporter.sendMail(mailOptions);

    req.flash(
      "success_msg",
      "An email with the verification code has been sent to your registered email address."
    );
    res.redirect("/resetemailsent?email=" + encodeURIComponent(user.email));
  } catch (error) {
    console.error(error);
    req.flash(
      "error_msg",
      "An error occurred while processing your request. Please try again."
    );
    res.redirect("/forgotpassword");
  }
});

//Reset Password Sent
const resetemailsent = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const email = req.session.userEmail;

  const user = await User.findOne({ email });

  if (!code) {
    req.flash("error_msg", "Please enter code");
    return res.redirect("/resetemailsent?email=" + encodeURIComponent(email));
  }

  if (user.resetPasswordCode !== code) {
    req.flash("error_msg", "Invalid verification code.");
    return res.redirect("/resetemailsent?email=" + encodeURIComponent(email));
  }

  if (user.resetPasswordCodeExpires < Date.now()) {
    req.flash("error_msg", "The verification code has expired.");
    return res.redirect("/resetemailsent?email=" + encodeURIComponent(email));
  }

  res.redirect(`/resetpassword?email=${encodeURIComponent(email)}`);
});

//Reser Password
const resetpassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  console.log(newPassword);
  const email = req.session.userEmail;
  console.log(email);

  // Validation
  try {
    // Validation
    if (!newPassword) {
      req.flash("error_msg", "Please enter a new password");
      return res.redirect("/resetpassword?email=" + encodeURIComponent(email));
    }
    if (newPassword.length < 8) {
      req.flash("error_msg", "New password must be at least 8 characters");
      return res.redirect("/resetpassword?email=" + encodeURIComponent(email));
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/resetpassword?email=" + encodeURIComponent(email));
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    req.flash(
      "success_msg",
      "Password successfully changed. Please proceed to login."
    );
    return res.redirect("/login");
  } catch (error) {
    console.error("Error resetting password:", error);
    req.flash(
      "error_msg",
      "An error occurred while resetting the password. Please try again."
    );
    return res.redirect("/resetpassword?email=" + encodeURIComponent(email));
  }
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
  forgotpassword,
  singleStudentData,
  resetemailsent,
  resetpassword,
  logout,
};
