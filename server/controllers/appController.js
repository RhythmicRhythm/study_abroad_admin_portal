const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
const request = require("request");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const generateApplicationNumber = () => {
  const length = 4; // Adjust the length as needed
  const numbers = "0123456789";
  const timestamp = Date.now().toString().slice(-length);
  let uniqueId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    uniqueId += numbers.charAt(randomIndex);
  }

  return `${timestamp}${uniqueId}`;
};

const step_a = asyncHandler(async (req, res) => {
  const {
    firstname,
    middlename,
    lastname,
    email,
    phone,
    study_country,
    program_of_study,
    course_of_study,
    paid_fee,
  } = req.body;

  const userId = req.user._id;
  console.log(userId);

  let fee_price = 0;

  if (study_country === "Canada") {
    fee_price = 400;
  } else if (study_country === "United Kingdom") {
    fee_price = 100;
  } else if (study_country === "Australia") {
    fee_price = 150;
  } else if (study_country === "Ireland") {
    fee_price = 200;
  } else if (study_country === "United States Of America") {
    fee_price = 120;
  }

  try {
    // Create a new Application instance with the posted data
    const app_data = {
      user: userId,
      application_number: generateApplicationNumber(),
      firstname,
      middlename,
      lastname,
      email,
      phone,
      study_country,
      program_of_study,
      course_of_study,
      fee_price,
      paid_fee,
    };

    // Save the application
    const application_details = await Application.create(app_data);

    console.log(application_details);

    // Get the ID of the newly created application
    const applicationId = application_details._id;

    // Construct the Flutterwave payment request with the application ID as tx_ref
    const options = {
      method: "POST",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: applicationId, // Use the application ID as tx_ref
        amount: application_details.fee_price, // Set the amount as needed
        currency: "NGN",
        redirect_url: `http://localhost:5000/success?applicationId=${encodeURIComponent(
          applicationId
        )}`,

        meta: {
          consumer_id: application_details.application_number,
          consumer_mac: "",
        },
        customer: {
          email: application_details.email,
          phonenumber: application_details.phone,
          name:
            application_details.firstname +
            application_details.middlename +
            application_details.lastname,
        },
        customizations: {
          title: "Study Abroad Application",
          logo: "https://res.cloudinary.com/dyvog4dzo/image/upload/v1700593102/edu/eduCentralLogo_ae7ep5.png",
        },
        subaccounts: [
          {
            id: "idjs",
            transaction_charge_type: "flat",
            transaction_charge: "50",
          },
        ],
      }),
    };

    // Make the Flutterwave payment request
    request(options, async (error, response) => {
      if (error) throw new Error(error);

      let resp = await JSON.parse(response.body);

      return res.redirect(resp.data.link);
    });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error);
  }
});

// FORM PERSONAL INFORMATION
const step_b = asyncHandler(async (req, res) => {
  const {
    dob,
    first_language,
    country_of_citizenship,
    gender,
    marital_status,
    state,
    address,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.dob = dob;
    application.first_language = first_language;
    application.country_of_citizenship = country_of_citizenship;

    application.gender = gender;
    application.marital_status = marital_status;
    application.state = state;
    application.address = address;

    await application.save();

    res.redirect(`/form2a?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }

  console.log(appId);
});

// ACADEMIC QUALIFICATION AND INTERNATION PASSPORT
const step_b_1 = asyncHandler(async (req, res) => {
  const {
    i_p_id,
    i_p_issue_date,
    i_p_expiry_date,
    i_p_issue_auth,
    academic_c,
    date_h_e_a,
    class_award,
    cgpa,
  } = req.body;

  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.i_p_id = i_p_id;
    application.i_p_issue_date = i_p_issue_date;
    application.i_p_expiry_date = i_p_expiry_date;
    application.i_p_issue_auth = i_p_issue_auth;
    application.academic_c = academic_c;
    application.date_h_e_a = date_h_e_a;
    application.class_award = class_award;
    application.cgpa = cgpa;

    await application.save();

    res.redirect(`/form2b?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }

  console.log(appId);
});

// ACADEMIC QUALIFICATION AND INTERNATION PASSPORT
const step_b_2 = asyncHandler(async (req, res) => {
  const {
    e_firstname,
    e_lastname,
    e_middlename,
    e_email,
    e_address,
    e_phone,
    e_relationship,
  } = req.body;

  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.e_firstname = e_firstname;
    application.e_lastname = e_lastname;
    application.e_middlename = e_middlename;
    application.e_email = e_email;
    application.e_address = e_address;
    application.e_phone = e_phone;
    application.e_relationship = e_relationship;

    await application.save();

    res.redirect(`/form3?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }

  console.log(appId);
});

// TEST SCORES
const step_c = asyncHandler(async (req, res) => {
  const {
    english_test,
    english_score,
    english_date,
    other_language,
    other_language_score,
    other_language_date,
    other_exam,
    other_exam_score,
    other_exam_date,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.english_test = english_test;
    application.english_score = english_score;
    application.english_date = english_date;
    application.other_language = other_language;
    application.other_language_score = other_language_score;
    application.other_language_date = other_language_date;
    application.other_exam = other_exam;
    application.other_exam_score = other_exam_score;
    application.other_exam_date = other_exam_date;

    await application.save();

    res.redirect(`/form3a?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});

// HIGH SCHOOL EDUCATION
const step_c_1 = asyncHandler(async (req, res) => {
  const {
    es_school,
    es_country,
    es_address,
    es_date_start,
    es_date_end,
    es_certificate,
    es_date_c,
    es_grade_award,
    es_other,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.es_school = es_school;
    application.es_country = es_country;
    application.es_address = es_address;
    application.es_date_start = es_date_start;
    application.es_date_end = es_date_end;
    application.es_certificate = es_certificate;
    application.es_date_c = es_date_c;
    application.es_grade_award = es_grade_award;
    application.es_other = es_other;

    await application.save();

    res.redirect(`/form3aq?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
// 2ND HIGH SCHOOL EDUCATION
const step_c_2 = asyncHandler(async (req, res) => {
  const {
    es_school_other,
    es_country_other,
    es_address_other,
    es_date_start_other,
    es_date_end_other,
    es_certificate_other,
    es_date_c_other,
    es_grade_award_other,
    es_other_other,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.es_school_other = es_school_other;
    application.es_country_other = es_country_other;
    application.es_address_other = es_address_other;
    application.es_date_start_other = es_date_start_other;
    application.es_date_end_other = es_date_end_other;
    application.es_certificate_other = es_certificate_other;
    application.es_date_c_other = es_date_c_other;
    application.es_grade_award_other = es_grade_award_other;
    application.es_other_other = es_other_other;

    await application.save();

    if (
      application.program_of_study === "Post Secondary (Pre-Bachelors)" ||
      application.program_of_study === "Bachelors"
    ) {
      res.redirect(`/form5?appId=${appId}`);
    } else {
      res.redirect(`/form4?appId=${appId}`);
    }

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});

const step_c_q_1 = asyncHandler(async (req, res) => {
  const { more_olevel_1 } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.more_olevel_1 = more_olevel_1;

    await application.save();

    // Check the value of more_olevel_1 for conditional redirect
    if (more_olevel_1 === "Yes") {
      res.redirect(`/form3b?appId=${appId}`);
    } else if (more_olevel_1 === "No") {
      // Check the program_of_study for further conditional redirect
      if (
        application.program_of_study === "Post Secondary (Pre-Bachelors)" ||
        application.program_of_study === "Bachelors"
      ) {
        res.redirect(`/form5?appId=${appId}`);
      } else {
        res.redirect(`/form4?appId=${appId}`);
      }
    }

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});

const step_d = asyncHandler(async (req, res) => {
  const {
    ts_school,
    ts_country,
    ts_address,
    ts_date_start,
    ts_date_end,
    ts_certificate,
    ts_date_c,
    ts_grade_award,
    ts_other,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.ts_school = ts_school;
    application.ts_country = ts_country;
    application.ts_address = ts_address;
    application.ts_date_start = ts_date_start;
    application.ts_date_end = ts_date_end;
    application.ts_certificate = ts_certificate;
    application.ts_date_c = ts_date_c;
    application.ts_grade_award = ts_grade_award;
    application.ts_other = ts_other;

    await application.save();

    res.redirect(`/form4q?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_d_q_1 = asyncHandler(async (req, res) => {
  const { additional_undergrad_1 } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.additional_undergrad_1 = additional_undergrad_1;

    await application.save();

    // Check the value of more_olevel_1 for conditional redirect
    if (additional_undergrad_1 === "Yes") {
      res.redirect(`/form4a?appId=${appId}`);
    } else if (additional_undergrad_1 === "No") {
      res.redirect(`/form5?appId=${appId}`);
    }

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_d_1 = asyncHandler(async (req, res) => {
  const {
    ts_school_other,
    ts_country_other,
    ts_address_other,
    ts_date_start_other,
    ts_date_end_other,
    ts_certificate_other,
    ts_date_c_other,
    ts_grade_award_other,
    ts_other_other,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.ts_school_other = ts_school_other;
    application.ts_country_other = ts_country_other;
    application.ts_address_other = ts_address_other;
    application.ts_date_start_other = ts_date_start_other;
    application.ts_date_end_other = ts_date_end_other;
    application.ts_certificate_other = ts_certificate_other;
    application.ts_date_c_other = ts_date_c_other;
    application.ts_grade_award_other = ts_grade_award_other;
    application.ts_other_other = ts_other_other;

    await application.save();

    res.redirect(`/form4aq?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_d_q_2 = asyncHandler(async (req, res) => {
  const { additional_undergrad_2 } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.additional_undergrad_2 = additional_undergrad_2;

    await application.save();

    // Check the value of more_olevel_1 for conditional redirect
    if (additional_undergrad_2 === "Yes") {
      res.redirect(`/form4b?appId=${appId}`);
    } else if (additional_undergrad_2 === "No") {
      res.redirect(`/form5?appId=${appId}`);
    }

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_d_2 = asyncHandler(async (req, res) => {
  const {
    tss_school_other,
    tss_country_other,
    tss_address_other,
    tss_date_start_other,
    tss_date_end_other,
    tss_certificate_other,
    tss_date_c_other,
    tss_grade_award_other,
    tss_other_other,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.tss_school_other = tss_school_other;
    application.tss_country_other = tss_country_other;
    application.tss_address_other = tss_address_other;
    application.tss_date_start_other = tss_date_start_other;
    application.tss_date_end_other = tss_date_end_other;
    application.tss_certificate_other = tss_certificate_other;
    application.tss_date_c_other = tss_date_c_other;
    application.tss_grade_award_other = tss_grade_award_other;
    application.tss_other_other = tss_other_other;

    await application.save();

    res.redirect(`/form5?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_e = asyncHandler(async (req, res) => {
  const { deported, deported_reason } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.deported = deported;
    application.deported_reason = deported_reason;

    await application.save();

    res.redirect(`/form5a?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_e_1 = asyncHandler(async (req, res) => {
  const {
    r_fullname_1,
    r_email_1,
    r_phone_1,
    r_employer_1,
    r_address_1,
    r_rank_1,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.r_fullname_1 = r_fullname_1;
    application.r_email_1 = r_email_1;
    application.r_phone_1 = r_phone_1;
    application.r_employer_1 = r_employer_1;
    application.r_address_1 = r_address_1;
    application.r_rank_1 = r_rank_1;

    await application.save();

    res.redirect(`/form5b?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_e_2 = asyncHandler(async (req, res) => {
  const {
    r_fullname_2,
    r_email_2,
    r_phone_2,
    r_employer_2,
    r_address_2,
    r_rank_2,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.r_fullname_2 = r_fullname_2;
    application.r_email_2 = r_email_2;
    application.r_phone_2 = r_phone_2;
    application.r_employer_2 = r_employer_2;
    application.r_address_2 = r_address_2;
    application.r_rank_2 = r_rank_2;

    await application.save();

    res.redirect(`/form5c?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});
const step_e_3 = asyncHandler(async (req, res) => {
  const {
    r_fullname_3,
    r_email_3,
    r_phone_3,
    r_employer_3,
    r_address_3,
    r_rank_3,
  } = req.body;
  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.r_fullname_3 = r_fullname_3;
    application.r_email_3 = r_email_3;
    application.r_phone_3 = r_phone_3;
    application.r_employer_3 = r_employer_3;
    application.r_address_3 = r_address_3;
    application.r_rank_3 = r_rank_3;

    await application.save();

    res.redirect(`/form6?appId=${appId}`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});

const step_f = asyncHandler(async (req, res) => {
  const cv_resume = req.files.cv_resume;
  const passport = req.files.passport;
  const international_passport = req.files.international_passport;
  const secondary_certificate = req.files.secondary_certificate;
  const undergraduate_certificate = req.files.undergraduate_certificate;
  const graduate_certificate = req.files.graduate_certificate;
  const post_certificate = req.files.post_certificate;
  const professional_certificate = req.files.professional_certificate;
  const personal_statement = req.files.personal_statement;

  const appId = req.body.help.trim();

  try {
    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Uploading cv_resume
    if (cv_resume) {
      const resultCvResume = await cloudinary.uploader.upload(
        cv_resume.tempFilePath,
        {
          public_id: `${Date.now()}_cv_resume`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.cv_resume = resultCvResume.secure_url;
      console.log(resultCvResume.secure_url);
    }

    // Uploading passport
    if (passport) {
      const resultPassport = await cloudinary.uploader.upload(
        passport.tempFilePath,
        {
          public_id: `${Date.now()}_passport`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.passport = resultPassport.secure_url;
      console.log(resultPassport.secure_url);
    }

    // Uploading international_passport
    if (international_passport) {
      const resultInternationalPassport = await cloudinary.uploader.upload(
        international_passport.tempFilePath,
        {
          public_id: `${Date.now()}_international_passport`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.international_passport =
        resultInternationalPassport.secure_url;
      console.log(resultInternationalPassport.secure_url);
    }

    // Repeat the pattern for the remaining fields...

    // Uploading secondary_certificate
    if (secondary_certificate) {
      const resultSecondaryCertificate = await cloudinary.uploader.upload(
        secondary_certificate.tempFilePath,
        {
          public_id: `${Date.now()}_secondary_certificate`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.secondary_certificate = resultSecondaryCertificate.secure_url;
      console.log(resultSecondaryCertificate.secure_url);
    }

    // Uploading undergraduate_certificate
    if (undergraduate_certificate) {
      const resultUndergraduateCertificate = await cloudinary.uploader.upload(
        undergraduate_certificate.tempFilePath,
        {
          public_id: `${Date.now()}_undergraduate_certificate`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.undergraduate_certificate =
        resultUndergraduateCertificate.secure_url;
      console.log(resultUndergraduateCertificate.secure_url);
    }
    // Uploading graduate_certificate
    if (graduate_certificate) {
      const resultGraduateCertificate = await cloudinary.uploader.upload(
        graduate_certificate.tempFilePath,
        {
          public_id: `${Date.now()}_graduate_certificate`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.graduate_certificate = resultGraduateCertificate.secure_url;
      console.log(resultGraduateCertificate.secure_url);
    }

    // Uploading post_certificate
    if (post_certificate) {
      const resultPostCertificate = await cloudinary.uploader.upload(
        post_certificate.tempFilePath,
        {
          public_id: `${Date.now()}_post_certificate`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.post_certificate = resultPostCertificate.secure_url;
      console.log(resultPostCertificate.secure_url);
    }

    // Uploading professional_certificate
    if (professional_certificate) {
      const resultProfessionalCertificate = await cloudinary.uploader.upload(
        professional_certificate.tempFilePath,
        {
          public_id: `${Date.now()}_professional_certificate`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.professional_certificate =
        resultProfessionalCertificate.secure_url;
      console.log(resultProfessionalCertificate.secure_url);
    }

    // Uploading resultPersonalStatement
    if (personal_statement) {
      const resultPersonalStatement = await cloudinary.uploader.upload(
        personal_statement.tempFilePath,
        {
          public_id: `${Date.now()}_personal_statement`,
          transformation: [
            { width: 1080, height: 1080, quality: 80, crop: "fill" },
          ],
        }
      );

      application.personal_statement = resultPersonalStatement.secure_url;
      console.log(resultPersonalStatement.secure_url);
    }

    await application.save();

    // Set completed_application to true
    application.completed_application = true;

    // Save the updated application with the completed_application value set to true
    await application.save();

    res.redirect(`/applicationdetails`);

    console.log(application);
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
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
};
