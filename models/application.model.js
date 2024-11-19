const mongoose = require('mongoose');

// Define the Application Schema
const applicationSchema = new mongoose.Schema({
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',  // Reference to JobSeeker model
    required: true
  },
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',  // Reference to Employer model
    required: true
  },
  resume: { type: String, required: true }, // Path to the resume file
  coverLetter: { type: String }, // Path to the cover letter file (optional)
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'interviewed', 'hired', 'rejected'], // Predefined statuses
    default: 'pending',
  },
  interview: {
    scheduled: { type: Boolean, default: false },
    date: { type: Date },
    time: { type: String },
    mode: {
      type: String,
      enum: ['online', 'in-person'], // Valid modes
      lowercase: true, // Ensure case-insensitive match
    },
    location: { type: String },
    link: { type: String },
  },
});

module.exports = mongoose.model('Application', applicationSchema);
