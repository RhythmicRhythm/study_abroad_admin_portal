const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Schema for both College and Primary Applications
const adminSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [8, "Password must be up to 8 characters"],
      // maxLength: [23, "Password must not be more than 23 characters"],
    },
  },
  {
    timestamps: true,
  }
);

//   Encrypt password before saving to DB
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

// // Export the College Application schema
// module.exports.CollegeApplication = mongoose.model(
//   "CollegeApplication",
//   applicationSchema
// );

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
