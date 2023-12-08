const express = require("express");
const request = require('request');
const {
  register,
  login,
  forgotpassword,
  resetemailsent,
  resetpassword,

  logout,
} = require("../controllers/userController");
const {
  step_a,
  step_b,
  step_b_1,
  step_b_2,
  step_c,
  step_c_1,
  step_c_2,
  step_c_q_1,
  step_d,
  step_d_q_1,
  step_d_1,
  step_d_q_2,
  step_d_2,
  step_e,
  step_e_1,
  step_e_2,
  step_e_3,
  step_f,
} = require("../controllers/appController");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");

const router = express.Router();

const { ensureAuthenticated } = require("../middleWare/auth");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

//logout
router.get("/logout", logout);

// Forgot password Page
router.get("/forgotpassword", (req, res) => res.render("forgotpassword"));

// Reset Email Sent Page
router.get("/resetemailsent", (req, res) => {
  // if (req.isAuthenticated()) {
  //   return res.redirect("/dashboard");
  // }

  const userEmail = req.query.email || "";
  req.session.userEmail = userEmail;
  res.render("resetemailsent", { email: userEmail });
});

router.get("/resetpassword", (req, res) => {
  // if (req.isAuthenticated()) {
  //   return res.redirect("/dashboard");
  // }
  const userEmail = req.query.email || "";
  req.session.userEmail = userEmail;
  res.render("resetpassword", { email: userEmail });
});

//test
router.get("/test", (req, res) => res.render("test"));

//College Reg
router.get("/form", (req, res) => res.render("form"));

// router.get("/success", (req, res) => res.render("success"));

router.get("/success", ensureAuthenticated, async (req, res) => {
  try {
    const { transaction_id } = req.query;
    const applicationId = req.query.applicationId;
    const userId = req.user.id;

    console.log(transaction_id);
    console.log(applicationId);
    console.log(userId);

    const application = await Application.findById(applicationId);
    if (!application) {
      // Handle the case where the application is not found
      return res.status(404).send("Application not found");
    }
    const user = await User.findById(userId);
    if (!user) {
      // Handle the case where the application is not found
      return res.status(404).send("Application not found");
    }

   
    console.log(application);

    if (req.query.status === 'successful' || req.query.status === 'completed') {
      // Perform verification with Flutterwave API
      const options = {
        method: 'GET',
        url: `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        headers: {
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      };

      request(options, async (error, resp) => {
        if (error) throw new Error(error);

        const response = await JSON.parse(resp.body);

        if (
          response.status === "success" &&
          response.data.status === "successful" &&
          response.data.amount == application.fee_price && 
          response.data.currency == "NGN" 
        ) {
          application.has_paid_fee = true;

          await application.save();

          user.wallet_balance += response.data.amount;
          await user.save();
          console.log(user);
          res.render("success");
        } else {
          // Handle verification failure
          res.status(400).send("Transaction verification failed");
        }
      });
    } else {
      // Handle transaction status other than 'successful' or 'completed'
      res.status(400).send("Invalid transaction status");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/application", (req, res) => res.render("application"));

router.get("/applicationstatus", ensureAuthenticated, async (req, res) => {
  try {
    // Get the user's ID from the authenticated request
    const userId = req.user.id;

    // Find applications associated with the user's ID where completed_application is false
    const userApplications = await Application.find({
      user: userId,
      completed_application: false,
    });

    // Render the "appstatus" view and pass the user and userApplications to it
    res.render("applicationstatus", { user: req.user, userApplications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/applicationdetails", ensureAuthenticated, async (req, res) => {
  try {
    // Get the user's ID from the authenticated request
    const userId = req.user.id;

    // Find only completed applications associated with the user's ID
    const completedApplications = await Application.find({
      user: userId,
      completed_application: true,
    });

    // Render the "appstatus" view and pass the user and completedApplications to it
    res.render("applicationdetails", {
      user: req.user,
      userApplications: completedApplications,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reg 1
router.get("/form1", ensureAuthenticated, (req, res) => {
  res.render("form1", { user: req.user });
});

// Reg 2
router.get("/form2", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form2", { applicationId });
});
router.get("/form2a", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form2a", { applicationId });
});
router.get("/form2b", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form2b", { applicationId });
});

// Reg 3
router.get("/form3", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form3", { applicationId });
});
router.get("/form3a", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form3a", { applicationId });
});
router.get("/form3aq", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form3aq", { applicationId });
});
router.get("/form3b", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form3b", { applicationId });
});
router.get("/form3c", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form3c", { applicationId });
});

// Reg 4
router.get("/form4", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form4", { applicationId });
});
router.get("/form4q", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form4q", { applicationId });
});
router.get("/form4a", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form4a", { applicationId });
});
router.get("/form4aq", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form4aq", { applicationId });
});
router.get("/form4b", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form4b", { applicationId });
});

// Reg 5
router.get("/form5", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form5", { applicationId });
});
router.get("/form5a", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form5a", { applicationId });
});
router.get("/form5b", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form5b", { applicationId });
});
router.get("/form5c", ensureAuthenticated, (req, res) => {
  const applicationId = req.query.appId;
  res.render("form5c", { applicationId });
});

// Reg 5
router.get("/form6", ensureAuthenticated, async (req, res) => {
  const applicationId = req.query.appId;

  const application = await Application.findById(applicationId);

  if (!application) {
    // Handle the case where the application is not found
    return res.status(404).send("Application not found");
  }
  res.render("form6", { applicationId, application });
});

// Dashboard Page
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // Get the user's ID from the authenticated request
    const userId = req.user.id;

    // Find all applications associated with the user's ID
    const allApplications = await Application.find({ user: userId });

    // Count the number of completed applications
    const completedApplicationsCount = allApplications.filter(
      (app) => app.completed_application === true
    ).length;

    // Count the number of uncompleted applications
    const uncompletedApplicationsCount = allApplications.filter(
      (app) => app.completed_application === false
    ).length;

    // Render the "dashboard" view and pass the user, allApplications,
    // completedApplicationsCount, and uncompletedApplicationsCount to it
    res.render("dashboard", {
      user: req.user,
      allApplications,
      completedApplicationsCount,
      uncompletedApplicationsCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:applyId", ensureAuthenticated, async (req, res) => {
  try {
    const applyId = req.params.applyId.trim(); // Use the correct parameter name
    const application = await Application.findById(applyId);

    if (!application) {
      // Handle the case where the application is not found
      return res.status(404).send("Application not found");
    }

    // Assuming you have user data available in req.user
    const user = req.user;

    // Render the "application" template and pass both application and user data
    res.render("application", { user: req.user, application });
  } catch (error) {
    // Handle errors appropriately, e.g., by rendering an error page
    res.status(500).send(error);
  }
});

// AUTHENTICATION ROUTES
router.post("/register", register);
router.post("/login", login);

router.post("/forgotpassword", forgotpassword);
router.post("/reset", resetemailsent);
router.post("/resetpassword", resetpassword);


// APPLICATION ROUTES
router.post("/form1", step_a);
router.post("/form2", step_b);
router.post("/form2a", step_b_1);
router.post("/form2b", step_b_2);
router.post("/form3", step_c);
router.post("/form3a", step_c_1);
router.post("/form3b", step_c_2);
router.post("/form3aq", step_c_q_1);
router.post("/form4", step_d);
router.post("/form4q", step_d_q_1);
router.post("/form4a", step_d_1);
router.post("/form4aq", step_d_q_2);
router.post("/form4b", step_d_2);
router.post("/form5", step_e);
router.post("/form5a", step_e_1);
router.post("/form5b", step_e_2);
router.post("/form5c", step_e_3);
router.post("/form6", step_f);


module.exports = router;
