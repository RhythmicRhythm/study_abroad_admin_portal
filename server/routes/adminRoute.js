const express = require("express");
const {
  register,
  login,
  singleStudentData,
  createApplicant,
  logout,
} = require("../controllers/adminController");

const router = express.Router();

const { ensureAuthenticated } = require("../middleWare/auth");

// Login Page
router.get("/login", (req, res) => res.render("loginadmin"));

// Register Page
router.get("/register", (req, res) => res.render("registeradmin"));

//Studentlist
router.get("/studentlist", (req, res) => res.render("studentlist"));

//Calender
router.get("/calender", (req, res) => res.render("calender"));

//test
router.get("/test", (req, res) => res.render("test"));

//Results
router.get("/results", (req, res) => res.render("results"));

//College Reg
router.get("/college", (req, res) => res.render("college"));

//Payment
router.get("/payment", (req, res) => res.render("payment"));

//Admission
router.get("/admission", (req, res) => res.render("admission"));

//College Reg
router.get("/form", (req, res) => res.render("form"));

// Dashboard Page
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { student: req.user });
});


router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
