const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  personal_data: {
    surname: { type: String, required: true },
    first_name: { type: String, required: true },
    middle_name: { type: String },
    date_of_birth: { type: Date, required: true },
    marital_status: { type: String },
    nationality: { type: String },
    state_of_origin: { type: String },
    lg: { type: String },

    residential_address: {
      mobile_phone_1: { type: String },
      phone_2: { type: String },
      disability: { type: String },
    },
  },

  academic_info: {
    last_secondary_school_attended: { type: String },
    year_of_graduation: { type: Number },
    school_location: { type: String },
    applying_with_awaiting_result: { type: Boolean },

    first_sitting: {
      subject_1: { type: String },
      grade_1: { type: String },
      subject_2: { type: String },
      grade_2: { type: String },
      subject_3: { type: String },
      grade_3: { type: String },
      subject_4: { type: String },
      grade_4: { type: String },
      subject_5: { type: String },
      grade_5: { type: String },
      subject_6: { type: String },
      grade_6: { type: String },
      subject_7: { type: String },
      grade_7: { type: String },
      subject_8: { type: String },
      grade_8: { type: String },
      subject_9: { type: String },
      grade_9: { type: String },
      subject_10: { type: String },
      grade_10: { type: String },
    },

    second_sitting: {
      subject_1: { type: String },
      grade_1: { type: String },
      subject_2: { type: String },
      grade_2: { type: String },
      subject_3: { type: String },
      grade_3: { type: String },
      subject_4: { type: String },
      grade_4: { type: String },
      subject_5: { type: String },
      grade_5: { type: String },
      subject_6: { type: String },
      grade_6: { type: String },
      subject_7: { type: String },
      grade_7: { type: String },
      subject_8: { type: String },
      grade_8: { type: String },
      subject_9: { type: String },
      grade_9: { type: String },
      subject_10: { type: String },
      grade_10: { type: String },
    },

    course_of_study: { type: String },
    department: { type: String },
    preferred_study: { type: String },
  },
  emergency_and_attestation: {
    full_name: { type: String },
    address: { type: String },
    phone_number: { type: String },
    relationship: { type: String },
    proof_of_payment: { type: String },
    confirmation: { type: Boolean },
    signature: { type: String },
    date: { type: String },
  },
});

const Applicant = mongoose.model("Applicant", applicantSchema);
module.exports = Applicant;
